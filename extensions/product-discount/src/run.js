import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.All,
  discounts: [],
};

// Discount tiers and percentages
const DISCOUNT_TIERS = [
  { threshold: 450, percentage: 100 },
  { threshold: 350, percentage: 70 },
  { threshold: 250, percentage: 50 },
  { threshold: 100, percentage: 10 },
  { threshold: 0, percentage: 0 },
];

export function run(input) {
  // Get the subtotal amount directly from the input
  let subtotalAmount = parseFloat(input.cart.cost.subtotalAmount.amount);
  let gwpAmount = 0; // Variable to hold the total cost of GWP products
  const gwpDiscounts = []; // Array to hold discounts for GWP products

  // Array to hold all product variant IDs for targeting discounts
  const variantIds = [];

  // Loop through the cart lines to find GWP products and collect variant IDs
  input.cart.lines.forEach((line) => {
    if (line.merchandise.product.productType === "GWP") {
      // Add the cost of the GWP product to gwpAmount
      gwpAmount += parseFloat(line.cost.amountPerQuantity.amount) * line.quantity;

      // Add 100% discount for each GWP product
      gwpDiscounts.push({
        targets: [
          {
            productVariant: {
              id: line.merchandise.id,
            },
          },
        ],
        value: {
          percentage: {
            value: 100, // 100% discount on GWP product
          },
        },
      });
    }

    // Collect variant IDs for non-GWP products
    variantIds.push(line.merchandise.id);
  });

  // Subtract GWP total cost from the subtotal
  subtotalAmount -= gwpAmount;

  // Determine the discount percentage based on the adjusted subtotal amount
  let discountPercentage = 0;
  for (const tier of DISCOUNT_TIERS) {
    if (subtotalAmount >= tier.threshold) {
      discountPercentage = tier.percentage;
      break; // Exit loop once the correct tier is found
    }
  }

  // If no discount should be applied, return the empty discount
  if (discountPercentage === 0 && gwpDiscounts.length === 0) {
    return EMPTY_DISCOUNT;
  } else {
    // Create the discounts array combining both order subtotal discount and individual product discounts
    const discounts = [];

    // Add order subtotal discount if applicable
    if (discountPercentage > 0) {
      discounts.push({
        message: `${discountPercentage}$ OFF for spending over $${DISCOUNT_TIERS.find((tier) => tier.percentage === discountPercentage).threshold}`,
        value: {
          fixedAmount: {
            amount: discountPercentage,
          },
        },
        targets: variantIds.map((id) => ({
          productVariant: {
            id: id,
          },
        })),
      });
    }

    // Combine GWP product discounts
    discounts.unshift(...gwpDiscounts);

    console.log("discounts-91:", JSON.stringify(discounts, null, 2));

    // Return the combined discount object
    return {
      discountApplicationStrategy: DiscountApplicationStrategy.All,
      discounts,
    };
  }
}








// import { DiscountApplicationStrategy } from "../generated/api";

// const EMPTY_DISCOUNT = {
//   discountApplicationStrategy: DiscountApplicationStrategy.First,
//   discounts: [],
// };

// const MIN_UNIQUE_PRODUCT = 2;
// const DISCOUNT_PER_PRODUCT = 5;
// const MAX_DISCOUNT = 20;

// export function run(input) {
//   const uniqueProducts = input.cart.lines.reduce((productIds, line) => {
//     productIds.add(line.merchandise.product.id);
//     return productIds;
//   }, new Set());

//   if (uniqueProducts.size < MIN_UNIQUE_PRODUCT) {
//     return EMPTY_DISCOUNT;
//   } else {
//     const discount = Math.min(uniqueProducts.size * DISCOUNT_PER_PRODUCT, MAX_DISCOUNT);
//     const uniqueDiscountProducts = discount / DISCOUNT_PER_PRODUCT;

//     return {
//       discountApplicationStrategy: DiscountApplicationStrategy.First,
//       discounts: [
//         {
//          // message: `${discount}% OFF for buying ${uniqueDiscountProducts} unique products`,
//           value: {
//             percentage: {
//               value: 10, // Convert to string with two decimal places
//             },
//           },
//           targets,
//         },
//       ],
//     };
//   }
// }


// export function run(input) {
//   const targets = input.cart.lines
//     // Only include cart lines with a quantity of two or more
//     .filter((line) => line.quantity >= 1)
//     .map((line) => {
//       return {
//         cartLine: {
//           id: line.id,
//         },
//       };
//     });

//   if (!targets.length) {
//     console.error("No cart lines qualify for volume discount.");
//     return EMPTY_DISCOUNT;
//   }

//   return {
//     discounts: [
//       {
//         targets,
//         value: {
//           percentage: {
//             value: "10.0",
//           },
//         },
//       },
//     ],
//     discountApplicationStrategy: DiscountApplicationStrategy.First,
//   };
// }
