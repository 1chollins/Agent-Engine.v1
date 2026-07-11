import { type TemplateRenderer } from "./shared";
import { BannerTemplate, EditorialTemplate, MinimalTemplate, OverlayTemplate } from "./classic";
import {
  BigTypeTemplate,
  ColorBlockTemplate,
  DiagonalTemplate,
  DuotoneTemplate,
  FramePopTemplate,
} from "./bold";
import {
  BubblesTemplate,
  NoteCardTemplate,
  PastelPanelTemplate,
  PolaroidTemplate,
  RoundedCardTemplate,
} from "./soft";
import {
  ArchedTemplate,
  BorderedTemplate,
  CircleTemplate,
  GoldLineTemplate,
  SideColumnTemplate,
} from "./luxury";
import {
  MagazineTemplate,
  RetroTemplate,
  RibbonTemplate,
  StickerTemplate,
  TicketTemplate,
} from "./playful";
import {
  ChecklistTemplate,
  ContactCardTemplate,
  CtaBannerTemplate,
  IconStatsTemplate,
  PriceTagTemplate,
  SplitSellTemplate,
} from "./marketing";
import {
  CollageHeroTemplate,
  FramedSoldTemplate,
  LabeledThumbsTemplate,
  ListingContactTemplate,
  MeetAgentTemplate,
  QuadGridTemplate,
} from "./showcase";
import {
  DiagonalContactTemplate,
  DiagonalDuoTemplate,
  DiagonalPriceTemplate,
  DiagonalProTemplate,
  DiagonalRibbonCornerTemplate,
  DiagonalStackTemplate,
  DiagonalWedgeTemplate,
  DiagonalWindowTemplate,
} from "./diagonal-split";
import {
  FlyerAddressTemplate,
  FlyerBrochureTemplate,
  FlyerClassicTemplate,
  FlyerEventTemplate,
  FlyerGridSixTemplate,
  FlyerInfoBarTemplate,
  FlyerTriTemplate,
  FlyerTwinAgentsTemplate,
} from "./flyer";
import {
  ScriptArchTemplate,
  ScriptBannerTemplate,
  ScriptClosedTemplate,
  ScriptNoteTemplate,
  ScriptOverPhotoTemplate,
  ScriptPolaroidTemplate,
} from "./script";
import {
  StatementFadeTemplate,
  StatementNumbersTemplate,
  StatementOutlineTemplate,
  StatementOverlayTemplate,
  StatementPosterTemplate,
  StatementSplitTemplate,
  StatementTowerTemplate,
  StatementUnderlineTemplate,
} from "./statement";
import {
  AgentBadgeTemplate,
  AgentCardTemplate,
  AgentFollowTemplate,
  AgentIntroLuxeTemplate,
  AgentMarketTemplate,
  AgentQuoteTemplate,
  AgentServicesGridTemplate,
  AgentSpotlightTemplate,
  AgentSplitChecklistTemplate,
  AgentTeamTemplate,
  AgentTestimonialTemplate,
  AgentTrustTemplate,
} from "./agent-promo";
import {
  CoBrandBarTemplate,
  CoBrandCirclesTemplate,
  CoBrandMastheadTemplate,
  CoBrandRibbonTemplate,
  CoBrandStackTemplate,
  CoBrandThanksTemplate,
} from "./cobrand";
import {
  BlockStackTemplate,
  BlushArchTemplate,
  BoothStripTemplate,
  CenteredSerifTemplate,
  DoodleFrameTemplate,
  EstateTemplate,
  FilmStripTemplate,
  GalleryPairTemplate,
  HostedByTemplate,
  LinkSpotTemplate,
  MosaicFiveTemplate,
  NoirGoldTemplate,
  OfferBannerTemplate,
  PhotoPunchTemplate,
  SideStripeTemplate,
  SpecSheetTemplate,
  StackedCardsTemplate,
  StarburstTemplate,
  TanCanvasTemplate,
  ThenNowTemplate,
  TopBarTemplate,
  TornEdgeTemplate,
  TripleBandTemplate,
} from "./extended";

export type TemplateGroup =
  | "Classic"
  | "Marketing"
  | "Showcase"
  | "Bold"
  | "Soft"
  | "Luxury"
  | "Playful"
  | "Diagonal"
  | "Flyer"
  | "Script"
  | "Statement"
  | "Agent Promo"
  | "Co-Brand";

export type TemplateMeta = {
  key: string;
  label: string;
  group: TemplateGroup;
  render: TemplateRenderer;
};

/**
 * The Post Studio template library. Add new templates by importing the renderer
 * and adding an entry here — the gallery, type union, and renderer map all derive
 * from this one list.
 */
export const TEMPLATES = [
  { key: "overlay", label: "Overlay", group: "Classic", render: OverlayTemplate },
  { key: "editorial", label: "Editorial", group: "Classic", render: EditorialTemplate },
  { key: "minimal", label: "Minimal", group: "Classic", render: MinimalTemplate },
  { key: "banner", label: "Banner", group: "Classic", render: BannerTemplate },
  { key: "topbar", label: "Top Bar", group: "Classic", render: TopBarTemplate },
  { key: "sidestripe", label: "Side Stripe", group: "Classic", render: SideStripeTemplate },
  { key: "centeredserif", label: "Centered Serif", group: "Classic", render: CenteredSerifTemplate },

  { key: "colorblock", label: "Color Block", group: "Bold", render: ColorBlockTemplate },
  { key: "duotone", label: "Duotone", group: "Bold", render: DuotoneTemplate },
  { key: "diagonal", label: "Diagonal", group: "Bold", render: DiagonalTemplate },
  { key: "bigtype", label: "Big Type", group: "Bold", render: BigTypeTemplate },
  { key: "framepop", label: "Frame Pop", group: "Bold", render: FramePopTemplate },
  { key: "blockstack", label: "Block Stack", group: "Bold", render: BlockStackTemplate },
  { key: "photopunch", label: "Photo Punch", group: "Bold", render: PhotoPunchTemplate },
  { key: "tancanvas", label: "Tan Canvas", group: "Bold", render: TanCanvasTemplate },

  { key: "rounded", label: "Rounded Card", group: "Soft", render: RoundedCardTemplate },
  { key: "polaroid", label: "Polaroid", group: "Soft", render: PolaroidTemplate },
  { key: "bubbles", label: "Bubbles", group: "Soft", render: BubblesTemplate },
  { key: "notecard", label: "Note Card", group: "Soft", render: NoteCardTemplate },
  { key: "pastel", label: "Pastel Mat", group: "Soft", render: PastelPanelTemplate },
  { key: "blusharch", label: "Blush Arch", group: "Soft", render: BlushArchTemplate },
  { key: "stackedcards", label: "Stacked Cards", group: "Soft", render: StackedCardsTemplate },
  { key: "doodleframe", label: "Doodle Frame", group: "Soft", render: DoodleFrameTemplate },

  { key: "arched", label: "Arched", group: "Luxury", render: ArchedTemplate },
  { key: "circle", label: "Circle", group: "Luxury", render: CircleTemplate },
  { key: "bordered", label: "Invitation", group: "Luxury", render: BorderedTemplate },
  { key: "sidecol", label: "Side Column", group: "Luxury", render: SideColumnTemplate },
  { key: "goldline", label: "Gold Line", group: "Luxury", render: GoldLineTemplate },
  { key: "estate", label: "Estate", group: "Luxury", render: EstateTemplate },
  { key: "noirgold", label: "Noir Gold", group: "Luxury", render: NoirGoldTemplate },
  { key: "gallerypair", label: "Gallery Pair", group: "Luxury", render: GalleryPairTemplate },

  { key: "sticker", label: "Sticker Badge", group: "Playful", render: StickerTemplate },
  { key: "magazine", label: "Magazine", group: "Playful", render: MagazineTemplate },
  { key: "ribbon", label: "Ribbon", group: "Playful", render: RibbonTemplate },
  { key: "retro", label: "Retro", group: "Playful", render: RetroTemplate },
  { key: "ticket", label: "Ticket", group: "Playful", render: TicketTemplate },
  { key: "tornedge", label: "Torn Edge", group: "Playful", render: TornEdgeTemplate },
  { key: "starburst", label: "Starburst", group: "Playful", render: StarburstTemplate },
  { key: "boothstrip", label: "Booth Strip", group: "Playful", render: BoothStripTemplate },

  { key: "ctabanner", label: "CTA Banner", group: "Marketing", render: CtaBannerTemplate },
  { key: "checklist", label: "Checklist", group: "Marketing", render: ChecklistTemplate },
  { key: "iconstats", label: "Icon Stats", group: "Marketing", render: IconStatsTemplate },
  { key: "pricetag", label: "Price Tag", group: "Marketing", render: PriceTagTemplate },
  { key: "splitsell", label: "Split Sell", group: "Marketing", render: SplitSellTemplate },
  { key: "contactcard", label: "Contact Card", group: "Marketing", render: ContactCardTemplate },
  { key: "offerbanner", label: "Offer Banner", group: "Marketing", render: OfferBannerTemplate },
  { key: "thennow", label: "Then / Now", group: "Marketing", render: ThenNowTemplate },
  { key: "linkspot", label: "Link Spot", group: "Marketing", render: LinkSpotTemplate },
  { key: "specsheet", label: "Spec Sheet", group: "Marketing", render: SpecSheetTemplate },

  { key: "collagehero", label: "Collage Hero", group: "Showcase", render: CollageHeroTemplate },
  { key: "quadgrid", label: "Quad Grid", group: "Showcase", render: QuadGridTemplate },
  { key: "meetagent", label: "Meet the Agent", group: "Showcase", render: MeetAgentTemplate },
  { key: "labeledthumbs", label: "Labeled Thumbs", group: "Showcase", render: LabeledThumbsTemplate },
  { key: "framedsold", label: "Framed Sold", group: "Showcase", render: FramedSoldTemplate },
  { key: "listingcontact", label: "Listing + Contact", group: "Showcase", render: ListingContactTemplate },
  { key: "filmstrip", label: "Film Strip", group: "Showcase", render: FilmStripTemplate },
  { key: "tripleband", label: "Triple Band", group: "Showcase", render: TripleBandTemplate },
  { key: "mosaicfive", label: "Mosaic Five", group: "Showcase", render: MosaicFiveTemplate },
  { key: "hostedby", label: "Hosted By", group: "Showcase", render: HostedByTemplate },

  { key: "diagpro", label: "Diagonal Pro", group: "Diagonal", render: DiagonalProTemplate },
  { key: "diagprice", label: "Diagonal Price", group: "Diagonal", render: DiagonalPriceTemplate },
  { key: "diagwedge", label: "Wedge", group: "Diagonal", render: DiagonalWedgeTemplate },
  { key: "diagribbon", label: "Corner Ribbon", group: "Diagonal", render: DiagonalRibbonCornerTemplate },
  { key: "diagduo", label: "Duo Split", group: "Diagonal", render: DiagonalDuoTemplate },
  { key: "diagstack", label: "Slant Stack", group: "Diagonal", render: DiagonalStackTemplate },
  { key: "diagcontact", label: "Contact Spotlight", group: "Diagonal", render: DiagonalContactTemplate },
  { key: "diagwindow", label: "Slant Window", group: "Diagonal", render: DiagonalWindowTemplate },

  { key: "flyerclassic", label: "Flyer Classic", group: "Flyer", render: FlyerClassicTemplate },
  { key: "flyertri", label: "Tri Photo", group: "Flyer", render: FlyerTriTemplate },
  { key: "flyerbrochure", label: "Brochure", group: "Flyer", render: FlyerBrochureTemplate },
  { key: "flyerinfobar", label: "Info Bar", group: "Flyer", render: FlyerInfoBarTemplate },
  { key: "flyergridsix", label: "Grid Six", group: "Flyer", render: FlyerGridSixTemplate },
  { key: "flyerevent", label: "Event Card", group: "Flyer", render: FlyerEventTemplate },
  { key: "flyeraddress", label: "Big Address", group: "Flyer", render: FlyerAddressTemplate },
  { key: "flyertwins", label: "Twin Agents", group: "Flyer", render: FlyerTwinAgentsTemplate },

  { key: "scriptclosed", label: "Script Closed", group: "Script", render: ScriptClosedTemplate },
  { key: "scriptpolaroid", label: "Script Polaroid", group: "Script", render: ScriptPolaroidTemplate },
  { key: "scriptover", label: "Script Over Photo", group: "Script", render: ScriptOverPhotoTemplate },
  { key: "scriptnote", label: "Script Note", group: "Script", render: ScriptNoteTemplate },
  { key: "scriptbanner", label: "Script Banner", group: "Script", render: ScriptBannerTemplate },
  { key: "scriptarch", label: "Script Arch", group: "Script", render: ScriptArchTemplate },

  { key: "stmtoverlay", label: "Grand Overlay", group: "Statement", render: StatementOverlayTemplate },
  { key: "stmtoutline", label: "Outline Type", group: "Statement", render: StatementOutlineTemplate },
  { key: "stmttower", label: "Letter Tower", group: "Statement", render: StatementTowerTemplate },
  { key: "stmtfade", label: "Type Fade", group: "Statement", render: StatementFadeTemplate },
  { key: "stmtposter", label: "Type Poster", group: "Statement", render: StatementPosterTemplate },
  { key: "stmtsplit", label: "Half & Half", group: "Statement", render: StatementSplitTemplate },
  { key: "stmtunderline", label: "Underline", group: "Statement", render: StatementUnderlineTemplate },
  { key: "stmtnumbers", label: "Big Numbers", group: "Statement", render: StatementNumbersTemplate },

  { key: "agentintro", label: "Intro Luxe", group: "Agent Promo", render: AgentIntroLuxeTemplate },
  { key: "agenttrust", label: "Trustworthy", group: "Agent Promo", render: AgentTrustTemplate },
  { key: "agentservices", label: "Services Grid", group: "Agent Promo", render: AgentServicesGridTemplate },
  { key: "agentcard", label: "Agent Card", group: "Agent Promo", render: AgentCardTemplate },
  { key: "agentquote", label: "Quote", group: "Agent Promo", render: AgentQuoteTemplate },
  { key: "agentspotlight", label: "Spotlight", group: "Agent Promo", render: AgentSpotlightTemplate },
  { key: "agentbadge", label: "Badge", group: "Agent Promo", render: AgentBadgeTemplate },
  { key: "agentchecklist", label: "Split Checklist", group: "Agent Promo", render: AgentSplitChecklistTemplate },
  { key: "agentfollow", label: "Follow Me", group: "Agent Promo", render: AgentFollowTemplate },
  { key: "agentmarket", label: "Market Expert", group: "Agent Promo", render: AgentMarketTemplate },
  { key: "agenttestimonial", label: "Testimonial", group: "Agent Promo", render: AgentTestimonialTemplate },
  { key: "agentteam", label: "Team Intro", group: "Agent Promo", render: AgentTeamTemplate },

  { key: "cobrandbar", label: "Split Bar", group: "Co-Brand", render: CoBrandBarTemplate },
  { key: "cobrandstack", label: "Card Stack", group: "Co-Brand", render: CoBrandStackTemplate },
  { key: "cobrandribbon", label: "Name Ribbon", group: "Co-Brand", render: CoBrandRibbonTemplate },
  { key: "cobrandcircles", label: "Twin Circles", group: "Co-Brand", render: CoBrandCirclesTemplate },
  { key: "cobrandthanks", label: "Thank You", group: "Co-Brand", render: CoBrandThanksTemplate },
  { key: "cobrandmasthead", label: "Masthead", group: "Co-Brand", render: CoBrandMastheadTemplate },
] as const satisfies readonly TemplateMeta[];

export type PostTemplate = (typeof TEMPLATES)[number]["key"];

export const RENDERERS = Object.fromEntries(TEMPLATES.map((t) => [t.key, t.render])) as Record<
  PostTemplate,
  TemplateRenderer
>;
