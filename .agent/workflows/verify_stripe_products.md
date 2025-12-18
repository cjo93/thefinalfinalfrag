---
description: Verify and Sync Stripe Products
---

# Verify Stripe Products Workflow

This workflow autonomously verifies that the required "DEFRAG Operator" and "DEFRAG Architect" products exist in the connected Stripe account.

## Steps

1.  **List Existing Products**
    Using the Stripe MCP, list all active products to see what currently exists.
    // turbo
    mcp_stripe_list_products(limit=10)

2.  **Verify or Create 'Operator' Tier**
    Check if a product named "DEFRAG Operator" exists in the list data from Step 1.
    - **IF** it exists: valid.
    - **IF** it does not exist: Create it using `mcp_stripe_create_product` and `mcp_stripe_create_price`.
      - Name: "DEFRAG Operator"
      - Amount: 1200 ($12.00)
      - Currency: usd

3.  **Verify or Create 'Architect' Tier**
    Check if a product named "DEFRAG Architect" exists in the list data from Step 1.
    - **IF** it exists: valid.
    - **IF** it does not exist: Create it using `mcp_stripe_create_product` and `mcp_stripe_create_price`.
      - Name: "DEFRAG Architect"
      - Amount: 4500 ($45.00)
      - Currency: usd

4.  **Report Results**
    Output the Product IDs and Price IDs found or created. Verify they match what is expected in `frontend/src/config/products.ts` (if that file exists).

5.  **Run Local Validation Script**
    Run the local script as a final double-check.
    // turbo
    run_command("npx ts-node src/scripts/init_stripe_products.ts")
