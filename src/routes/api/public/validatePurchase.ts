import { allItems } from "./items/index";
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

    // This next line accepts the payments from users, and makes sure that the payment is valid.
    const orderDetails = await onApproveActions.order?.capture();

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
        for (const purchasedItem of purchasedItems) {
            // Remember to convert purchasedItem.unit_amount.value to cents for comparison
            if (allItemStock.find(ref => ref._id === purchasedItem.sku)?.currentPriceCents !== Number(purchasedItem.unit_amount.value) * 100) {
                return {
                    status: 401,
                    body: {
                        success: false
                    }
                }
            }
        }

        // The stock of the product has already been updated in the initial button click phase. Just add the customer order to the db.

        const dbConnection = await clientPromise;
        const db = dbConnection.db(process.env["DB_NAME"]);
        const collection = db.collection(process.env["DB_STOCK_COLLECTION"] as string);

        collection.insertOne(
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
