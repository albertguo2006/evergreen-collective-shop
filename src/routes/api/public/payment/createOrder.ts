import { allItems } from "../items";
import type { CartItem } from "$lib/cartItems";
import type { RequestHandler } from "@sveltejs/kit";
import type { CreateOrderRequestBody } from "@paypal/paypal-js";


export const POST: RequestHandler = async ({ request }) => {

    const { cart }: { cart: CartItem[] } = await request.json();

    if (cart === undefined) {
        return {
            status: 401,
            body: {
                error: "Invalid request body. Ensure it is a valid json entry of the shopping cart",
            }
        };
    }

    const allItemStock = await allItems();

    const createOrderRequestBody: CreateOrderRequestBody = ({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "CAD",
                    value: cart
                        .reduce(
                            (acc, cur) =>
                                acc +
                                cur.quantity *
                                (allItemStock.find((ref) => ref._id === cur.itemId)?.currentPriceCents ??
                                    0 / 100),
                            0
                        )
                        .toString(),
                    breakdown: {
                        item_total: {
                            currency_code: "CAD",
                            value: cart
                                .reduce(
                                    (acc, cur) =>
                                        acc +
                                        cur.quantity *
                                        (allItemStock.find((ref) => ref._id === cur.itemId)?.currentPriceCents ??
                                            0 / 100),
                                    0
                                )
                                .toString()
                        }
                    }
                },
                items: cart.map((item) => ({
                    name: allItemStock.find((ref) => ref._id === item.itemId)?.name ?? "UNKNOWN",
                    quantity: item.quantity.toString(),
                    unit_amount: {
                        currency_code: "CAD",
                        value: (
                            allItemStock.find((ref) => ref._id === item.itemId)?.currentPriceCents ?? 0 / 100
                        ).toString()
                    },
                    sku: item.itemId.toString(),
                    // 62d1d58fbd0546308bcd212a is the id for a donation
                    category:
                        item.itemId.toString() === "62d1d58fbd0546308bcd212a"
                            ? "DONATION"
                            : "PHYSICAL_GOODS"
                }))
            }
        ]
    });

    cart.forEach((item) => {

        const ref = allItemStock.find((ref) => ref._id === item.itemId);

        if (ref === undefined) {
            return {
                status: 401,
                body: {
                    error: `Invalid item id ${item.itemId} in cart`,
                }
            }
        }

        if (!ref.isUnlimited && (ref.originalStockIfLimited ?? NaN - ref.sold - item.quantity < 0)) {
            return {
                status: 401,
                body: {
                    error: `Insufficient stock for item ${item.itemId} in cart`,
                    insufficientStock: true
                }
            }
        }

    })

    return {
        status: 200,
        body: {
            order: createOrderRequestBody
        }
    }

}