# Checkout Flow — Product Requirements Document

## Overview

Redesign the checkout flow to reduce cart abandonment. Users currently drop off at the payment step. The new flow should be single-page, support guest checkout, and add Apple Pay and Google Pay.

## Problem Statement

Current checkout completion rate: 31%. Industry average: 68%. The current 4-step checkout (cart → shipping → payment → confirmation) causes users to abandon before completing a purchase.

## Goals

- Increase checkout completion rate to 55%+ within 60 days of launch
- Reduce time-to-purchase to under 90 seconds for returning users
- Support guest checkout without account creation

## User Stories

### Guest Checkout
- As a guest user, I want to check out without creating an account so I can buy quickly.
- As a guest user, I want to save my email to receive an order confirmation.
- As a guest user, I can optionally create an account after placing my order.

### Payment
- As a user, I want to pay with a credit/debit card.
- As a user, I want to pay with Apple Pay on Safari/iOS.
- As a user, I want to pay with Google Pay on Chrome/Android.
- As a user, I want my card details to be saved for future purchases if I choose.

### Shipping
- As a user, I want to enter a shipping address and see available shipping options with prices and estimated delivery dates.
- As a user, I want to use a saved address if I have an account.
- As a returning user, my last shipping address should be pre-filled.

### Order Summary
- As a user, I want to see an itemized order summary including product names, quantities, prices, shipping cost, taxes, and total before paying.
- As a user, I want to apply a promo code and see the discount applied before paying.

### Confirmation
- As a user, I want an order confirmation number immediately after payment.
- As a user, I want a confirmation email within 2 minutes.

## Business Rules

- Promo codes are case-insensitive
- A promo code can only be used once per user
- Promo codes cannot be stacked
- If a promo code is expired, show an error before payment
- Tax is calculated based on shipping address state
- Shipping is free for orders over $75
- Payment must be authorized before order is created in the system
- If payment fails, the cart must remain intact
- Orders placed after 2pm EST ship the next business day
- Out-of-stock items must be removed from cart before checkout proceeds

## Edge Cases Mentioned

- Cart contains items from multiple sellers
- Item goes out of stock between cart and checkout
- Session expires mid-checkout
- User navigates back after payment authorization

## Assumptions

- Credit card processing is via Stripe
- Apple Pay / Google Pay domain verification is already complete
- Tax calculation API is already integrated
- Email service is SendGrid

## Non-Goals (this release)

- PayPal
- Crypto payments
- Buy now, pay later
- International shipping
- Multi-currency
