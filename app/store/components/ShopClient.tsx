"use client";
import React from "react";
import Shop from "./Shop";

/**
 * ShopClient
 * Simple client wrapper so server pages can safely render a client-only component.
 * The real Shop component (Shop.tsx) remains the client-side cart implementation.
 */

export default function ShopClient() {
  return <Shop />;
}