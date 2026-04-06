import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import { formatPrice, hexToRgba } from "../image-renderer";

type StoryTemplateProps = {
  listing: Listing;
  brand: BrandProfile;
  photoBase64: string;
  photoMimeType: string;
  headshot64: string | null;
  logo64: string | null;
  teaser: string;
  cta: string;
};

export function buildStoryTemplate(props: StoryTemplateProps) {
  const { listing, brand, photoBase64, photoMimeType, headshot64, logo64, teaser, cta } = props;
  const width = 1080;
  const height = 1920;
  const price = formatPrice(listing.price);
  const photoUrl = `data:${photoMimeType};base64,${photoBase64}`;
  const primaryBg = hexToRgba(brand.primary_color, 0.9);
  const accentColor = brand.accent_color ?? brand.secondary_color;

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
        // Full-bleed background photo
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
        // Dark gradient overlay for text readability
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width,
              height,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.75) 100%)",
            },
          },
        },
        // Top bar: logo + brokerage
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 60,
              left: 40,
              right: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },
            children: [
              logo64
                ? {
                    type: "div",
                    props: {
                      style: {
                        padding: "8px 16px",
                        backgroundColor: "rgba(255,255,255,0.95)",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                      },
                      children: [
                        {
                          type: "img",
                          props: {
                            src: `data:image/png;base64,${logo64}`,
                            style: { height: 36, objectFit: "contain" },
                          },
                        },
                      ],
                    },
                  }
                : null,
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 20,
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 400,
                  },
                  children: brand.brokerage_name,
                },
              },
            ].filter(Boolean),
          },
        },
        // Center teaser text
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 700,
              left: 40,
              right: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 52,
                    fontWeight: 700,
                    color: "white",
                    textAlign: "center",
                    lineHeight: 1.2,
                    textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                    maxWidth: 900,
                  },
                  children: teaser,
                },
              },
            ],
          },
        },
        // Bottom section: price, address, CTA, agent
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: 0,
              left: 0,
              width,
              display: "flex",
              flexDirection: "column",
              padding: "40px 40px 80px",
              backgroundColor: primaryBg,
            },
            children: [
              // Price
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 64,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 8,
                  },
                  children: price,
                },
              },
              // Address + details
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 24,
                    color: "rgba(255,255,255,0.85)",
                    marginBottom: 24,
                  },
                  children: `${listing.address}, ${listing.city}, ${listing.state}`,
                },
              },
              // CTA button
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "16px 32px",
                    backgroundColor: accentColor,
                    borderRadius: 12,
                    marginBottom: 24,
                    alignSelf: "flex-start",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 24,
                          fontWeight: 700,
                          color: "white",
                        },
                        children: cta,
                      },
                    },
                  ],
                },
              },
              // Agent info
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                  },
                  children: [
                    headshot64
                      ? {
                          type: "img",
                          props: {
                            src: `data:image/png;base64,${headshot64}`,
                            style: {
                              width: 52,
                              height: 52,
                              borderRadius: "50%",
                              objectFit: "cover",
                              marginRight: 16,
                              border: "2px solid rgba(255,255,255,0.5)",
                            },
                          },
                        }
                      : null,
                    {
                      type: "div",
                      props: {
                        style: { display: "flex", flexDirection: "column" },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                fontSize: 22,
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
                                fontSize: 18,
                                color: "rgba(255,255,255,0.8)",
                              },
                              children: brand.phone,
                            },
                          },
                        ],
                      },
                    },
                  ].filter(Boolean),
                },
              },
            ],
          },
        },
      ],
    },
  };
}
