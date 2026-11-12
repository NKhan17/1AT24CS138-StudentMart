import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);
    const [cartError, setCartError] = useState("");

    const token = localStorage.getItem("studentmartToken");

    const fetchCart = async () => {
        const currentToken = localStorage.getItem("studentmartToken");
        if (!currentToken) {
            setCart({ items: [] });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCart(data.cart || { items: [] });
            }
        } catch (err) {
            console.error("Cart fetch error:", err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [token]);

    const addToCart = async (productId, quantity = 1) => {
        const currentToken = localStorage.getItem("studentmartToken");
        if (!currentToken) {
            return { success: false, message: "Please log in to add items to cart." };
        }

        setLoading(true);
        setCartError("");

        try {
            const response = await fetch(`${API_BASE_URL}/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();

            if (!response.ok) {
                setCartError(data.message || "Failed to add to cart");
                return { success: false, message: data.message || "Failed to add to cart" };
            }

            setCart(data.cart);
            return { success: true, message: data.message || "Added to cart" };
        } catch (err) {
            const errorMsg = "Unable to connect to server";
            setCartError(errorMsg);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        const currentToken = localStorage.getItem("studentmartToken");
        if (!currentToken) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setCart(data.cart);
            }
        } catch (err) {
            console.error("Remove from cart error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        const currentToken = localStorage.getItem("studentmartToken");
        if (!currentToken) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/cart/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();
            if (response.ok) {
                setCart(data.cart);
            } else {
                alert(data.message || "Could not update quantity");
            }
        } catch (err) {
            console.error("Update quantity error:", err);
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        const currentToken = localStorage.getItem("studentmartToken");
        if (!currentToken) return;

        try {
            const response = await fetch(`${API_BASE_URL}/cart/clear`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            });
            if (response.ok) {
                setCart({ items: [] });
            }
        } catch (err) {
            console.error("Clear cart error:", err);
        }
    };

    const totalItems = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                cartError,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                fetchCart,
                totalItems
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

