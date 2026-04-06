import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import { formatPrice, hexToRgba } from "../image-renderer";

type PostTemplateProps = {
  listing: Listing;
  brand: BrandProfile;
  photoBase64: string;
  photoMimeType: string;
  headshot64: string | null;
  logo64: string | null;
  variant: "square" | "landscape";
};

export function buildPostTemplate(props: PostTemplateProps) {
  const { listing, brand, photoBase64, photoMimeType, headshot64, logo64, variant } = props;
  const isSquare = variant === "square";
  const width = isSquare ? 1080 : 1200;
  const height = isSquare ? 1080 : 630;

  const price = formatPrice(listing.price);
  const details = [
    listing.bedrooms ? `${listing.bedrooms} Bed` : null,
    listing.bathrooms ? `${listing.bathrooms} Bath` : null,
    `${listing.sqft.toLocaleString()} Sqft`,
  ]
    .filter(Boolean)
    .join("  •  ");

  const photoUrl = `data:${photoMimeType};base64,${photoBase64}`;
  const primaryBg = hexToRgba(brand.primary_color, 0.92);
  const secondaryBg = hexToRgba(brand.secondary_color, 0.85);

  // Bottom bar height scales with image
  const barHeight = isSquare ? 260 : 170;
  const priceSize = isSquare ? 48 : 36;
  const detailSize = isSquare ? 24 : 18;
  const addressSize = isSquare ? 20 : 16;
  const nameSize = isSquare ? 20 : 16;

  return {
    type: "div",
    props: {
      style: {
        width,
        height,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "Inter",
        overflow: "hidden",
      },
      children: [
        // Background photo
        {
          type: "img",
          props: {
            src: photoUrl,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width,
              height,
              objectFit: "cover",
            },
          },
        },
        // Top-left logo badge
        logo64
          ? {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  top: 20,
                  left: 20,
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: 8,
                },
                children: [
                  {
                    type: "img",
                    props: {
                      src: `data:image/png;base64,${logo64}`,
                      style: { height: isSquare ? 40 : 30, objectFit: "contain" },
                    },
                  },
                ],
              },
            }
          : null,
        // Bottom branded bar
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: 0,
              left: 0,
              width,
              height: barHeight,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: isSquare ? "20px 30px" : "14px 24px",
              backgroundColor: primaryBg,
            },
            children: [
              // Price row
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: isSquare ? 8 : 4,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: priceSize,
                          fontWeight: 700,
                          color: "white",
                        },
                        children: price,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: detailSize,
                          color: "rgba(255,255,255,0.9)",
                          fontWeight: 400,
                        },
                        children: details,
                      },
                    },
                  ],
                },
              },
              // Address
              {
                type: "div",
                props: {
                  style: {
                    fontSize: addressSize,
                    color: "rgba(255,255,255,0.85)",
                    marginBottom: isSquare ? 16 : 8,
                  },
                  children: `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip_code}`,
                },
              },
              // Agent bar
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    padding: isSquare ? "10px 16px" : "6px 12px",
                    backgroundColor: secondaryBg,
                    borderRadius: 8,
                  },
                  children: [
                    headshot64
                      ? {
                          type: "img",
                          props: {
                            src: `data:image/png;base64,${headshot64}`,
                            style: {
                              width: isSquare ? 44 : 32,
                              height: isSquare ? 44 : 32,
                              borderRadius: "50%",
                              objectFit: "cover",
                              marginRight: 12,
                            },
                          },
                        }
                      : null,
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                fontSize: nameSize,
                                fontWeight: 700,
                                color: "white",
                              },
                              children: brand.agent_name,
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: {
                                fontSize: nameSize - 2,
                                color: "rgba(255,255,255,0.8)",
                              },
                              children: `${brand.brokerage_name}  •  ${brand.phone}`,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ].filter(Boolean),
    },
  };
}
