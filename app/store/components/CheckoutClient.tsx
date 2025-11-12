"use client";
import React from "react";
import CheckoutForm from "./CheckoutForm";

/**
 * CheckoutClient
 * Client wrapper for CheckoutForm so the server checkout page can import it without using ssr:false dynamic.
 */

export default function CheckoutClient() {
  return <CheckoutForm />;
}