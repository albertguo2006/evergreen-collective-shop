import { allItems } from "../items/index";
import dotenv from "dotenv";
import type { RequestHandler } from "@sveltejs/kit";
import type { OnApproveActions } from "@paypal/paypal-js";
import clientPromise from "$lib/mongoDB";
import { Product, Purchase, PurchaseStatus } from "$lib/Purchase";
import { ObjectId } from "mongodb";

dotenv.config();

export const POST: RequestHandler = async ({ request }) => {

    const { onApproveActions, name, email }: { onApproveActions: OnApproveActions, name: string, email: string } = await request.json();

    if (onApproveActions === undefined || name === undefined || email === undefined) {
        return {
            status: 401,
            body: {
                error: "Invalid request body. Ensure it is a valid json entry of onApproveActions, name and email",
                success: false
            }
        };
    }

    // Check order details first, to confirm that we still have stock
    const orderDetails = await onApproveActions.order?.get();

    if (orderDetails === undefined || orderDetails.status !== "APPROVED") {
        return {
            status: 401,
            body: {
                error: "Invalid payment. Ensure the payment is approved",
                success: false
            }
        }
    }

    const purchase = orderDetails.purchase_units[0];
    const purchasedItems = purchase.items;

    if (purchasedItems === undefined) {
        return {
            status: 401,
            body: {
                error: "Invalid purchase. Ensure the purchase has items",
                success: false
            }
        }
    }

    if (Number(purchase?.amount.value) !== purchasedItems?.reduce((acc, item) => acc + Number(item.quantity) * Number(item.unit_amount.value), 0)) {
        const allItemStock = await allItems();
        purchasedItems.forEach( purchasedItem => {
            const ref = allItemStock.find( ref => ref._id.toString() === purchasedItem.sku );

            if (ref === undefined) {
                return {
                    status: 401,
                    body: {
                        error: `Invalid item id ${purchasedItem.sku} in purchased`,
                        success: false
                    }
                }
            }

            // Remember to convert purchasedItem.unit_amount.value to cents for comparison
            if (ref.currentPriceCents !== Number(purchasedItem.unit_amount.value) * 100) {
                return {
                    status: 401,
                    body: {
                        error: "Incorrect item price",
                        success: false
                    }
                }
            }

            if (!ref.isUnlimited && (ref.originalStockIfLimited ?? NaN - ref.sold - Number(purchasedItem.quantity) < 0)) {
                return {
                    status: 401,
                    body: {
                        error: `Insufficient stock for item ${ref.name}`,
                        success: false
                    }
                }
            }
        });

        await onApproveActions.order?.capture(); // Capture the payment

        const dbConnection = await clientPromise;
        const db = dbConnection.db(process.env["DB_NAME"]);
        const stockCollection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);
        const purchaseCollection = db.collection(process.env["DB_PURCHASE_COLLECTION"] as string);

        purchasedItems.forEach(purchasedItem => {
            const ref = allItemStock.find(ref => ref._id === purchasedItem.sku);

            if (ref === undefined) {
                return {
                    status: 401,
                    body: {
                        error: `Invalid item id ${purchasedItem.sku} in purchased`,
                        success: false
                    }
                }
            }

            const update = ref.isUnlimited ? {
                sold: ref.sold + Number(purchasedItem.quantity),
            } : {
                sold: ref.sold + Number(purchasedItem.quantity),
                originalStockIfLimited: ref.originalStockIfLimited ?? NaN - Number(purchasedItem.quantity)
            }


            stockCollection.updateOne(
                { _id: purchasedItem.sku },
                { $set: JSON.stringify(update) }
            );
        });

        purchaseCollection.insertOne(
            new Purchase(
                name,
                email,
                purchasedItems.map(
                    item => new Product(
                        new ObjectId(item.sku),
                        Number(item.unit_amount.value) * 100,
                        Number(item.quantity
                        )
                    )
                ),
                PurchaseStatus.NeedsContacting
            )
        );

        return {
            status: 200,
            body: {
                success: true
            }
        }
    }

    return {
        status: 401,
        body: {
            success: false
        }
    }

}
