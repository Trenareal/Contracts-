import { ContractMaterialItem, ContractType, SalaryDetails } from '../types';

export interface OccupationDefinition {
  id: string;
  title: string;
  category: string;
  contractType?: ContractType;
  iconName: string;
  defaultScope: string;
  defaultTerms: string;
  defaultMaterials: Array<Omit<ContractMaterialItem, 'id' | 'totalPrice'>>;
  defaultSalaryDetails?: Partial<SalaryDetails>;
}

export const OCCUPATIONS_DATABASE: OccupationDefinition[] = [
  // --- FASHION, APPAREL & TAILORING (1-10) ---
  {
    id: 'tailor-bespoke',
    title: 'Fashion Design & Bespoke Tailoring',
    category: 'Fashion & Apparel',
    iconName: 'Scissors',
    defaultScope: `Tailor agrees to measure, pattern, cut, stitch, and deliver bespoke traditional and ceremonial outfits according to agreed fittings and style designs. Includes up to two fitting sessions prior to final hem and finishing.`,
    defaultTerms: `1. FITTINGS: Client must attend scheduled fitting sessions on time. Final adjustments requested after final delivery will incur additional alterations fees.
2. FABRIC CARE: Client provided or selected fabrics must meet pre-inspection standards.
3. DEPOSIT: 50% non-refundable deposit required before cutting or tailoring commences.`,
    defaultMaterials: [
      { item: 'Premium Cashmere Wool Fabric', quantity: 4, quality: 'Super 150s Italian Wool (Yards)', unitPrice: 35000 },
      { item: 'Silk Lining & Interfacing', quantity: 3, quality: '100% Pure Mulberry Silk', unitPrice: 12000 },
      { item: 'Custom Horn Buttons & Gold Thread Set', quantity: 1, quality: 'Handcrafted Premium Trimmings', unitPrice: 15000 },
    ]
  },
  {
    id: 'fashion-embroidery',
    title: 'Embroidery & Beading',
    category: 'Fashion & Apparel',
    iconName: 'Sparkles',
    defaultScope: `Handcraft custom beadwork, lace applique, metallic thread embroidery, and crystal embellishments on evening gowns, bridal dresses, or ceremonial agbada garments.`,
    defaultTerms: `1. HANDICRAFT VARIANCE: Minor handcrafted variances in bead patterns are natural indicators of artisan craftsmanship.
2. CLEANING: Dry clean only with specialist garment handler.`,
    defaultMaterials: [
      { item: 'Swarovski Crystal Beads & Glass Bugles', quantity: 2, quality: 'Grade A Imported Austrian Crystal Pack', unitPrice: 45000 },
      { item: 'Metallic Thread Spools (Gold/Silver)', quantity: 5, quality: 'Non-Tarnish High Duty Metallic Thread', unitPrice: 8000 },
    ]
  },
  {
    id: 'cobbler-shoe-maker',
    title: 'Shoemaking & Footwear Craft',
    category: 'Fashion & Apparel',
    iconName: 'Footprints',
    defaultScope: `Craft custom leather shoes, boots, or sandals tailored to client foot measurements, including hand-welted leather soles, stacked heels, and custom polish finish.`,
    defaultTerms: `1. FOOT MEASUREMENTS: Custom last is shaped strictly to client measurements.
2. SOLE REPAIR WARRANTY: 6-month craftsman warranty on Goodyear welt stitching.`,
    defaultMaterials: [
      { item: 'Full Grain Italian Calfskin Leather', quantity: 2, quality: 'Grade A Vegetable Tanned Hide', unitPrice: 50000 },
      { item: 'Goodyear Leather Soles & Rubber Heels', quantity: 1, quality: 'Heavy Duty Stacked Leather Sole Set', unitPrice: 25000 },
    ]
  },
  {
    id: 'leather-craftsman',
    title: 'Leathercraft & Bag Making',
    category: 'Fashion & Apparel',
    iconName: 'Briefcase',
    defaultScope: `Design and hand-stitch premium leather briefcases, handbags, wallets, or luggage with reinforced brass hardware, suede lining, and burnished edges.`,
    defaultTerms: `1. NATURAL LEATHER CHARACTER: Grain marks and color nuance are authentic hide characteristics.
2. CARE: Keep away from prolonged moisture exposure.`,
    defaultMaterials: [
      { item: 'Top Grain Cowhide Leather Sheet', quantity: 1, quality: '3mm Heavy Duty Bridle Leather', unitPrice: 65000 },
      { item: 'Solid Brass Buckles & YKK Zippers', quantity: 4, quality: 'Antiqued Corrosion Resistant Brass', unitPrice: 18000 },
    ]
  },
  {
    id: 'upholsterer-furniture',
    title: 'Furniture Upholstery',
    category: 'Fashion & Apparel',
    iconName: 'Armchair',
    defaultScope: `Re-upholster sofa sets, armchairs, or vehicle interiors. Includes foam replacement, spring tensioning, frame repair, and precision fabric stapling.`,
    defaultTerms: `1. FRAME INTEGRITY: Provider will inspect underlying wooden frames and advise if structural replacement is needed before fabric padding.`,
    defaultMaterials: [
      { item: 'Heavy Duty Velvet/Jacquard Upholstery Fabric', quantity: 12, quality: 'High Martindale Wear Rating (Yards)', unitPrice: 15000 },
      { item: 'High Density Orthopedic Foam Block', quantity: 3, quality: 'Density 45 High Resilience Foam', unitPrice: 28000 },
    ]
  },
  {
    id: 'milliner-hatmaker',
    title: 'Hatmaking & Millinery',
    category: 'Fashion & Apparel',
    iconName: 'Crown',
    defaultScope: `Design custom fascinators, brimmed hats, and bridal headpieces for weddings, galas, and official ceremonies.`,
    defaultTerms: `1. FITTING: Head circumference measured prior to blocking.`,
    defaultMaterials: [
      { item: 'Sinamay Straw & Feather Trimmings', quantity: 1, quality: 'Grade A Natural Straw Block', unitPrice: 20000 }
    ]
  },
  {
    id: 'screen-printer',
    title: 'Screen Printing & Apparel',
    category: 'Fashion & Apparel',
    iconName: 'Printer',
    defaultScope: `Screen print or heat transfer custom logos, text, and artwork across bulk order t-shirts, jerseys, uniforms, or promotional tote bags.`,
    defaultTerms: `1. COLOR MATCHING: Spot color printing matched as closely as possible to Pantone standards.`,
    defaultMaterials: [
      { item: 'Plastisol Textile Inks & Screens', quantity: 50, quality: 'High Opaque Wash-Fast Screen Print', unitPrice: 1200 }
    ]
  },
  {
    id: 'curtain-drapery-maker',
    title: 'Curtains & Drapery',
    category: 'Fashion & Apparel',
    iconName: 'Columns',
    defaultScope: `Measure, stitch, line, and install custom window curtains, blackout drapes, sheer sheer panels, and motorized curtain tracks.`,
    defaultTerms: `1. INSTALLATION SITE: Client must provide clear access to window walls for mounting tracks.`,
    defaultMaterials: [
      { item: 'Blackout Thermal Curtain Fabric', quantity: 20, quality: '100% Light Blocking Triple Weave', unitPrice: 8500 }
    ]
  },
  {
    id: 'uniform-manufacturer',
    title: 'Uniform Manufacturing',
    category: 'Fashion & Apparel',
    iconName: 'Shirt',
    defaultScope: `Manufacture bulk staff or school uniforms including embroidered chest logos, durable stitching, and reinforced pockets.`,
    defaultTerms: `1. SIZING CHART: Sizes verified per employee before bulk cutting.`,
    defaultMaterials: [
      { item: 'Durable Poly-Cotton Twill Uniform Fabric', quantity: 50, quality: 'Heavy Duty Wash & Wear Fabric', unitPrice: 4500 }
    ]
  },
  {
    id: 'jewelry-goldsmith',
    title: 'Jewelry & Goldsmithing',
    category: 'Fashion & Apparel',
    iconName: 'Gem',
    defaultScope: `Forge custom gold, silver, or platinum rings, necklaces, or bracelets with gemstone setting, engraving, and hallmarking.`,
    defaultTerms: `1. PRECIOUS METAL SPOT PRICE: Metal valuation fixed on contract deposit date.`,
    defaultMaterials: [
      { item: '18K Yellow Gold Grain', quantity: 15, quality: 'Certified 750 Pure Gold (Grams)', unitPrice: 85000 }
    ]
  },

  // --- CARPENTRY, WOODWORKING & FURNITURE (11-20) ---
  {
    id: 'carpenter-cabinetmaker',
    title: 'Carpentry & Cabinetmaking',
    category: 'Woodworking & Carpentry',
    iconName: 'Hammer',
    defaultScope: `Construct and install custom solid wood kitchen cabinets, wardrobes, bookcases, or dining tables with concealed soft-close hinges and durable varnish.`,
    defaultTerms: `1. MOISTURE CONTENT: All hardwood is kiln-dried to under 12% moisture content to prevent warping.
2. SITE MEASUREMENTS: Provider will take precise laser measurements on site before panel cutting.`,
    defaultMaterials: [
      { item: 'Teak/Mahogany Hardwood Planks', quantity: 10, quality: 'Kiln Dried Grade A Solid Timber', unitPrice: 45000 },
      { item: 'Marine Plywood Sheets (18mm)', quantity: 8, quality: 'Waterproof WBP Marine Grade Plywood', unitPrice: 22000 },
      { item: 'Blum Soft-Close Hinges & Drawer Runners', quantity: 12, quality: 'Heavy Duty German Soft-Close Set', unitPrice: 8500 },
    ]
  },
  {
    id: 'roofing-carpenter',
    title: 'Roofing Framework',
    category: 'Woodworking & Carpentry',
    iconName: 'Home',
    defaultScope: `Erect timber roof trusses, ridge beams, rafters, and fascia boards according to architectural structural drawings.`,
    defaultTerms: `1. ANTI-TERMITE TREATMENT: All roofing timber treated with anti-termite chemical preservative prior to installation.`,
    defaultMaterials: [
      { item: 'Hardwood Timber Truss Beams (2x6)', quantity: 40, quality: 'Pressure Treated Structural Hardwood', unitPrice: 7500 },
      { item: 'Anti-Termite Preservative Oil', quantity: 5, quality: 'Industrial Wood Treatment Liquid (Liters)', unitPrice: 18000 }
    ]
  },
  {
    id: 'flooring-carpenter',
    title: 'Hardwood & Parquet Flooring',
    category: 'Woodworking & Carpentry',
    iconName: 'Grid',
    defaultScope: `Lay, sand, stain, and seal solid hardwood floorboards, herringbone parquet blocks, or heavy-duty laminate wood flooring.`,
    defaultTerms: `1. SUBFLOOR PREPARATION: Subfloor must be completely level, clean, and dry prior to installation.`,
    defaultMaterials: [
      { item: 'Oak Wood Flooring Planks', quantity: 50, quality: '18mm Tongue & Groove Solid Oak (Sqm)', unitPrice: 28000 }
    ]
  },
  {
    id: 'door-window-carpenter',
    title: 'Doors & Window Joinery',
    category: 'Woodworking & Carpentry',
    iconName: 'DoorClosed',
    defaultScope: `Fabricate and hang custom solid hardwood security entrance doors, panel interior doors, and carved wooden window frames with locks.`,
    defaultTerms: `1. HARDWARE MOUNTING: Hinges and locksets installed according to manufacturer tolerances.`,
    defaultMaterials: [
      { item: 'Solid Iroko Wood Entrance Door Slab', quantity: 2, quality: 'Carved 50mm Hardwood Door', unitPrice: 180000 }
    ]
  },
  {
    id: 'formwork-carpenter',
    title: 'Concrete Formwork',
    category: 'Woodworking & Carpentry',
    iconName: 'Box',
    defaultScope: `Build rigid timber and marine plywood formwork moulds for reinforced concrete columns, beams, suspended slabs, and staircases.`,
    defaultTerms: `1. CONCRETE PRESSURE: Formwork braced to withstand wet concrete pouring without flexing or bulging.`,
    defaultMaterials: [
      { item: 'Film-Faced Shuttering Plywood (18mm)', quantity: 20, quality: 'High Re-use Phenolic Film Board', unitPrice: 24000 }
    ]
  },
  {
    id: 'carver-sculptor',
    title: 'Wood Carving & Sculpture',
    category: 'Woodworking & Carpentry',
    iconName: 'Feather',
    defaultScope: `Carve intricate relief panels, decorative wall plaques, carved furniture legs, or traditional ceremonial wooden sculptures.`,
    defaultTerms: `1. ARTISTIC CREATIVITY: Relief carving executed following approved sketch mockups.`,
    defaultMaterials: [
      { item: 'Ebony / Mahogany Carving Wood Block', quantity: 1, quality: 'Dense Flawless Sculpting Block', unitPrice: 95000 }
    ]
  },
  {
    id: 'decking-carpenter',
    title: 'Decking & Pergolas',
    category: 'Woodworking & Carpentry',
    iconName: 'Sun',
    defaultScope: `Construct weather-resistant outdoor timber decks, pool surrounds, wooden pergolas, and garden pavilions.`,
    defaultTerms: `1. WEATHER SEALANT: Outdoor deck finished with UV-resistant water repellent oil.`,
    defaultMaterials: [
      { item: 'Composite / Teak Decking Boards', quantity: 30, quality: 'UV Resistant Slip-Proof Planks', unitPrice: 18000 }
    ]
  },
  {
    id: 'stage-set-builder',
    title: 'Stage & Event Sets',
    category: 'Woodworking & Carpentry',
    iconName: 'Tv',
    defaultScope: `Build temporary timber stages, display booths, backdrop frames, and exhibition structures for events and concerts.`,
    defaultTerms: `1. DISMANTLING: Includes setup before event and complete tear-down after event concluded.`,
    defaultMaterials: [
      { item: 'Stage Riser Wooden Platform Modules', quantity: 8, quality: 'Heavy Duty Load Rated Modular Stage', unitPrice: 45000 }
    ]
  },
  {
    id: 'picture-framer',
    title: 'Picture Framing',
    category: 'Woodworking & Carpentry',
    iconName: 'Image',
    defaultScope: `Handcraft ornate wooden picture frames with museum-grade acid-free matting and anti-reflective UV protective glass.`,
    defaultTerms: `1. ARTWORK PRESERVATION: Acid-free backing materials used exclusively.`,
    defaultMaterials: [
      { item: 'Gilded Carved Wood Moulding', quantity: 4, quality: 'Hand Gilded Italian Profile (Meters)', unitPrice: 14000 }
    ]
  },
  {
    id: 'boatbuilder-carpenter',
    title: 'Boat Building & Marine Wood',
    category: 'Woodworking & Carpentry',
    iconName: 'Anchor',
    defaultScope: `Construct or repair wooden boat hulls, decks, oars, and marine cabinetry using water-resistant epoxy resins and stainless fasteners.`,
    defaultTerms: `1. WATER TIGHTNESS: Hull leak tested in water prior to final client handoff.`,
    defaultMaterials: [
      { item: 'Marine Grade Mahogany & Epoxy Resin', quantity: 1, quality: 'Structural Marine Timber Set', unitPrice: 250000 }
    ]
  },

  // --- WELDING, METALWORK & FABRICATION (21-30) ---
  {
    id: 'welder-structural',
    title: 'Structural Steel Welding',
    category: 'Metalwork & Welding',
    iconName: 'Flame',
    defaultScope: `Fabricate, align, and weld structural I-beams, steel warehouse frames, heavy steel gates, security doors, and metal staircases according to structural engineering drawings.`,
    defaultTerms: `1. WELD QUALITY: All MIG/TIG welding done with full penetration joints according to AWS structural welding code.
2. PRIMER & PAINT: Metal surfaces shot-blasted and coated with rust-inhibiting anti-corrosion zinc chromate primer.
3. SITE SAFETY: Contractor will adhere to strict hot-work safety procedures on site.`,
    defaultMaterials: [
      { item: 'Universal Steel I-Beams (200x200mm)', quantity: 6, quality: 'Grade S275 Structural Steel (6m Lengths)', unitPrice: 120000 },
      { item: 'Heavy Square Hollow Steel Tubing (50x50mm)', quantity: 15, quality: '3mm Wall Thickness Mild Steel Pipe', unitPrice: 18000 },
      { item: 'Low Hydrogen Welding Electrodes E7018', quantity: 3, quality: '5kg Pack High Strength Electrode', unitPrice: 14000 },
      { item: 'Zinc Chromate Anti-Rust Primer Paint', quantity: 2, quality: 'Industrial Grade Anti-Corrosion (20L Drum)', unitPrice: 38000 },
    ]
  },
  {
    id: 'wrought-iron-craftsman',
    title: 'Wrought Iron & Metal Railings',
    category: 'Metalwork & Welding',
    iconName: 'Shield',
    defaultScope: `Design, forge, and install ornamental wrought iron security entrance gates, balcony balustrades, staircase railings, and burglar proofing.`,
    defaultTerms: `1. GALVANIZATION: Hot-dip galvanized coating applied prior to powder coating to prevent rusting.`,
    defaultMaterials: [
      { item: 'Wrought Iron Ornamental Scrolls & Bars', quantity: 20, quality: 'Hand Forged Solid Iron Elements', unitPrice: 6500 }
    ]
  },
  {
    id: 'stainless-welder',
    title: 'Stainless Steel & TIG Welding',
    category: 'Metalwork & Welding',
    iconName: 'Zap',
    defaultScope: `TIG weld food-grade stainless steel piping, handrails, kitchen extraction hoods, and pharmaceutical processing tanks with mirror finish polishing.`,
    defaultTerms: `1. CORROSION GRADE: Grade 304/316 stainless steel verified with metal analyzer swab.`,
    defaultMaterials: [
      { item: 'Grade 304 Stainless Steel Pipe (2 inch)', quantity: 8, quality: 'Mirror Polished Seamless Pipe', unitPrice: 32000 }
    ]
  },
  {
    id: 'aluminum-fabricator',
    title: 'Aluminum Windows & Facades',
    category: 'Metalwork & Welding',
    iconName: 'Layout',
    defaultScope: `Fabricate and install aluminum sliding windows, projected casements, glass curtain walls, and automatic sliding glass storefronts.`,
    defaultTerms: `1. WEATHER SEAL: Silicon weather sealant applied around all perimeter window openings.`,
    defaultMaterials: [
      { item: 'Powder-Coated Aluminum Extrusions', quantity: 12, quality: '1.8mm Gauge Architectural Profile', unitPrice: 28000 },
      { item: '6mm Toughened Tempered Glass Panels', quantity: 10, quality: 'Shatter-Resistant Safety Glass (Sqm)', unitPrice: 22000 }
    ]
  },
  {
    id: 'blacksmith-forger',
    title: 'Blacksmithing & Tool Forging',
    category: 'Metalwork & Welding',
    iconName: 'Hammer',
    defaultScope: `Forge custom iron tools, decorative hinges, blades, fireplace hearth sets, and architectural metal fittings in anvil furnace.`,
    defaultTerms: `1. ANNEALING: All forged tools oil-quenched and tempered for optimal hardness.`,
    defaultMaterials: [
      { item: 'High Carbon Tool Steel Rods', quantity: 5, quality: 'Grade 1095 Forging Steel', unitPrice: 15000 }
    ]
  },
  {
    id: 'sheet-metal-worker',
    title: 'Sheet Metal & Ductwork',
    category: 'Metalwork & Welding',
    iconName: 'Box',
    defaultScope: `Cut, bend, roll, and assemble galvanized sheet metal HVAC air ducts, exhaust hoods, gutters, and metal chimney flues.`,
    defaultTerms: `1. LEAK TEST: Air ducting joints sealed with foil tape and mastic sealant.`,
    defaultMaterials: [
      { item: 'Galvanized Sheet Metal Roll (24 Gauge)', quantity: 2, quality: '0.7mm Heavy Zinc Coated Steel Sheet', unitPrice: 48000 }
    ]
  },
  {
    id: 'tank-fabricator',
    title: 'Storage Tanks & Vessels',
    category: 'Metalwork & Welding',
    iconName: 'Database',
    defaultScope: `Construct heavy plate steel diesel storage tanks, overhead water towers, or pressure vessels with dye penetrant weld testing.`,
    defaultTerms: `1. PRESSURE TESTING: Hydrostatic leak test performed at 1.5x working pressure for 2 hours before signoff.`,
    defaultMaterials: [
      { item: '6mm Mild Steel Boiler Plates', quantity: 4, quality: 'Grade A Heavy Duty Steel Sheet', unitPrice: 145000 }
    ]
  },
  {
    id: 'auto-body-welder',
    title: 'Auto Body & Chassis Welding',
    category: 'Metalwork & Welding',
    iconName: 'Truck',
    defaultScope: `Repair vehicle chassis frames, weld truck bed bodies, patch rusted floor panels, and reinforce heavy trailer hitches.`,
    defaultTerms: `1. CHASSIS ALIGNMENT: Laser chassis measuring verified prior to structural welding.`,
    defaultMaterials: [
      { item: 'High Strength Steel Channel Beams', quantity: 4, quality: 'Automotive Structural Steel Profile', unitPrice: 38000 }
    ]
  },
  {
    id: 'scaffold-welder',
    title: 'Scaffolding Fabrication',
    category: 'Metalwork & Welding',
    iconName: 'Layers',
    defaultScope: `Fabricate heavy duty steel ringlock scaffolding frames, cross braces, adjustable screw jacks, and metal walking boards.`,
    defaultTerms: `1. LOAD CAPACITY: Scaffolding towers load-rated to 500kg per platform level.`,
    defaultMaterials: [
      { item: 'Scaffolding Tubular Steel Frames', quantity: 20, quality: '48.3mm OD Galvanized Tube Set', unitPrice: 25000 }
    ]
  },
  {
    id: 'fencing-fabricator',
    title: 'Security Fencing & Gates',
    category: 'Metalwork & Welding',
    iconName: 'Lock',
    defaultScope: `Install anti-climb 3D mesh security fencing, concertina razor wire coils, anti-crash bollards, and automated gate motors.`,
    defaultTerms: `1. ANCHORING: Fence posts embedded in 600mm deep concrete footings.`,
    defaultMaterials: [
      { item: 'Concertina Razor Wire Coils (500mm)', quantity: 10, quality: 'Stainless Steel Core Razor Coil', unitPrice: 16000 }
    ]
  },

  // --- ELECTRICAL, PLUMBING & HVAC (31-40) ---
  {
    id: 'electrician-master',
    title: 'Electrical Installation & Power',
    category: 'Electrical & Power',
    iconName: 'Zap',
    defaultScope: `Complete conduit piping, cable drawing, distribution board (DB) wiring, circuit breaker sizing, earthing pit installation, light fixtures, and socket points.`,
    defaultTerms: `1. ELECTRICAL CODE: All wiring complies strictly with IEE Wiring Regulations.
2. EARTHING TEST: Earth resistance test guaranteed below 5 Ohms upon completion.`,
    defaultMaterials: [
      { item: 'Copper Building Cable (2.5mm Pure Copper)', quantity: 6, quality: 'Flame Retardant Pure Copper Roll (100m)', unitPrice: 42000 },
      { item: 'Single/Three Phase Distribution Board', quantity: 1, quality: '12-Way Enclosed Metal DB Box with MCBs', unitPrice: 65000 },
      { item: 'Earth Copper Rod & Enhancing Compound', quantity: 2, quality: '16mm x 1.8m Copper Clad Earth Rod Set', unitPrice: 22000 }
    ]
  },
  {
    id: 'solar-installer',
    title: 'Solar & Renewable Energy',
    category: 'Electrical & Power',
    iconName: 'Sun',
    defaultScope: `Design, mount, wire, and commission off-grid/hybrid solar power systems including solar panels, lithium battery banks, MPPT charge controllers, and pure sine wave inverters.`,
    defaultTerms: `1. WARRANTY: 5-year solar panel performance warranty; 3-year lithium battery warranty.`,
    defaultMaterials: [
      { item: '550W Monocrystalline Solar Panels', quantity: 8, quality: 'Tier 1 High Efficiency Mono Panel', unitPrice: 110000 },
      { item: '10kWh Lithium LiFePO4 Battery Pack', quantity: 1, quality: '48V 200Ah Wall Mounted Lithium Battery', unitPrice: 1850000 },
      { item: '5kW Hybrid Solar Inverter', quantity: 1, quality: 'Pure Sine Wave MPPT 48V Inverter', unitPrice: 450000 }
    ]
  },
  {
    id: 'plumber-master',
    title: 'Plumbing & Sanitation',
    category: 'Plumbing & Sanitation',
    iconName: 'Droplet',
    defaultScope: `Install PPR/PEX clean water pressure piping, PVC soil waste drainage, water pumps, water heaters, water storage tanks, and luxury bathroom sanitary ware.`,
    defaultTerms: `1. PRESSURE LEAK TEST: All water supply lines pressure tested at 8 Bar for 24 hours prior to wall plastering.`,
    defaultMaterials: [
      { item: 'PPR Hot/Cold Water Pipes (25mm)', quantity: 15, quality: 'German Standard Fusion Welded PPR (4m)', unitPrice: 4500 },
      { item: 'Automatic Water Booster Pump (1.5HP)', quantity: 1, quality: 'Stainless Steel Pressure Sensor Pump', unitPrice: 95000 },
      { item: 'Wall-Hung Ceramic Toilet & Concealed Cistern', quantity: 2, quality: 'Dual Flush Soft Close Sanitaryware', unitPrice: 140000 }
    ]
  },
  {
    id: 'hvac-technician',
    title: 'HVAC & Air Conditioning',
    category: 'HVAC & Climate',
    iconName: 'Wind',
    defaultScope: `Install, duct, wire, evacuate, and charge VRF central air conditioning systems, ceiling cassette units, or industrial split ACs with refrigerant pressure testing.`,
    defaultTerms: `1. VACUUM evacuation performed to 500 microns before R410a/R32 refrigerant gas charge.`,
    defaultMaterials: [
      { item: 'Inverter Ceiling Cassette AC Unit (3 HP)', quantity: 2, quality: 'Energy Efficient R410a Cassette Unit', unitPrice: 650000 },
      { item: 'Insulated Twin Copper Piping (1/4 x 5/8)', quantity: 30, quality: 'Seamless Refrigerant Grade Copper (Meters)', unitPrice: 7500 }
    ]
  },
  {
    id: 'borehole-driller',
    title: 'Borehole Drilling & Pumps',
    category: 'Plumbing & Sanitation',
    iconName: 'Compass',
    defaultScope: `Drill water borehole down to aquiferous rock strata, install heavy duty PVC casing pipes, gravel pack filter, submersible water pump, and water treatment filtration plant.`,
    defaultTerms: `1. WATER QUALITY: Water sample lab tested for potability standards post-drilling.`,
    defaultMaterials: [
      { item: 'Heavy Duty PVC Casing Pipe (6 inch)', quantity: 20, quality: 'Threaded Deep Well Casing (3m)', unitPrice: 18000 },
      { item: '3HP Stainless Submersible Water Pump', quantity: 1, quality: 'High Head Multi-Stage Deep Well Pump', unitPrice: 220000 }
    ]
  },
  {
    id: 'generator-technician',
    title: 'Diesel Generator Maintenance',
    category: 'Electrical & Power',
    iconName: 'Activity',
    defaultScope: `Install, service, overhaul, and synchronize heavy diesel power generators, Automatic Transfer Switches (ATS), soundproof canopies, and fuel piping.`,
    defaultTerms: `1. LOAD BANK TEST: Generator tested under 100% rated resistive load for 1 hour before handoff.`,
    defaultMaterials: [
      { item: 'Automatic Transfer Switch (ATS) Panel 250A', quantity: 1, quality: 'Motorized Dual Power Changeover Switch', unitPrice: 350000 }
    ]
  },
  {
    id: 'fire-safety-engineer',
    title: 'Fire Alarms & Safety Systems',
    category: 'Electrical & Power',
    iconName: 'AlertTriangle',
    defaultScope: `Install addressable fire alarm panels, smoke detectors, sprinkler piping, fire hose reels, and CO2 fire suppression systems.`,
    defaultTerms: `1. FIRE MARSHAL CERTIFICATION: System tested and certified compliant with fire safety codes.`,
    defaultMaterials: [
      { item: 'Addressable Optical Smoke Detectors', quantity: 12, quality: 'EN54 Certified Microprocessor Detector', unitPrice: 18500 }
    ]
  },
  {
    id: 'cctv-security-installer',
    title: 'CCTV & Access Control',
    category: 'Electrical & Power',
    iconName: 'Shield',
    defaultScope: `Mount 4K IP CCTV cameras, draw CAT6 network cables, setup Network Video Recorders (NVR), biometric door access controllers, and electric gate barriers.`,
    defaultTerms: `1. REMOTE ACCESS: Remote phone viewing app configured on client devices.`,
    defaultMaterials: [
      { item: '4K IP Dome & Bullet CCTV Cameras', quantity: 8, quality: 'Night Vision ColorVu Smart AI Camera', unitPrice: 38000 },
      { item: '16-Channel NVR with 6TB Surveillance HDD', quantity: 1, quality: 'PoE 4K Network Video Recorder Box', unitPrice: 240000 }
    ]
  },
  {
    id: 'elevator-technician',
    title: 'Elevator & Lift Systems',
    category: 'Electrical & Power',
    iconName: 'ArrowUpRight',
    defaultScope: `Assemble passenger elevator guide rails, traction gear machine, cabin interior, floor indicator call panels, and safety governor brake systems.`,
    defaultTerms: `1. SAFETY BRAKE CERTIFICATE: Drop test and safety brake engagement verified before public use.`,
    defaultMaterials: [
      { item: 'Steel Wire Traction Cables & Guide Shoes', quantity: 1, quality: 'High Tensile Elevator Cable Set', unitPrice: 480000 }
    ]
  },
  {
    id: 'pool-maintenance',
    title: 'Swimming Pool Installation',
    category: 'Plumbing & Sanitation',
    iconName: 'Maximize',
    defaultScope: `Plumb pool circulation pipes, install sand filters, chlorinator pumps, LED underwater lights, and tile pool basins.`,
    defaultTerms: `1. WATER BALANCING: Initial chemical shock and pH balancing included.`,
    defaultMaterials: [
      { item: 'High Flow Pool Sand Filter & Pump (2HP)', quantity: 1, quality: 'UV Resistant Fiberglass Filter Tank', unitPrice: 380000 }
    ]
  },

  // --- MASONRY, BUILDING & CONSTRUCTION (41-50) ---
  {
    id: 'mason-bricklayer',
    title: 'Masonry & Bricklaying',
    category: 'Construction & Building',
    iconName: 'Layers',
    defaultScope: `Lay hollow/solid concrete blocks, build foundation footings, damp-proof courses (DPC), concrete lintels, columns, and smooth wall plastering/rendering.`,
    defaultTerms: `1. CEMENT MIX RATIO: Structural mortar mixed at 1:4 cement to sharp sand ratio; plastering at 1:6 ratio.
2. CURING: Concrete elements wet-cured for minimum 7 days.`,
    defaultMaterials: [
      { item: 'Portland Cement Bags (50kg Grade 42.5N)', quantity: 100, quality: 'High Strength Fresh Portland Cement', unitPrice: 8500 },
      { item: 'Vibrated 9-Inch Hollow Concrete Blocks', quantity: 500, quality: 'Machine Molded Load Bearing Blocks', unitPrice: 750 },
      { item: 'Sharp Clean River Sand (Tipper Load)', quantity: 2, quality: 'Silt-Free Coarse Concrete Sand', unitPrice: 95000 }
    ]
  },
  {
    id: 'tiler-marble-installer',
    title: 'Tiling & Marble Installation',
    category: 'Construction & Building',
    iconName: 'Grid',
    defaultScope: `Lay ceramic floor tiles, porcelain wall tiles, polished marble slabs, or granite kitchen countertops with laser level alignment and waterproof grouting.`,
    defaultTerms: `1. ADHESIVE FULL BED: Tiles laid with full bed tile cement adhesive without hollow air pockets under tiles.`,
    defaultMaterials: [
      { item: 'Porcelain Floor Tiles (60x60cm)', quantity: 40, quality: 'Grade A Vitrified Polished Porcelain (Sqm)', unitPrice: 12000 },
      { item: 'High Performance Polymer Tile Adhesive Bags', quantity: 15, quality: 'Flex Waterproof Tile Cement (20kg)', unitPrice: 4800 }
    ]
  },
  {
    id: 'painter-decorator',
    title: 'Painting & Wall Decoration',
    category: 'Construction & Building',
    iconName: 'Palette',
    defaultScope: `Screed interior walls, apply anti-fungal primer coat, and paint multiple coats of premium washable emulsion paint on interior and exterior walls.`,
    defaultTerms: `1. SURFACE PREPARATION: All cracks filled with wall putty and sanded smooth prior to painting.`,
    defaultMaterials: [
      { item: 'Premium Washable Silk Acrylic Paint Drum', quantity: 4, quality: 'High Coverage 20 Litre Drum', unitPrice: 55000 },
      { item: 'Wall Screeding Putty Powder Bags', quantity: 10, quality: 'Ultra Fine Smooth Finish Putty (20kg)', unitPrice: 6500 }
    ]
  },
  {
    id: 'roofer-aluminum',
    title: 'Roofing & Sheet Installation',
    category: 'Construction & Building',
    iconName: 'Home',
    defaultScope: `Install step-tiles or corrugated aluminum longspan roof sheets, ridge caps, valley gutters, and rainwater downspouts with leak-proof neoprene washers.`,
    defaultTerms: `1. LEAK GUARANTEE: 2-year workmanship warranty against roof water leaks.`,
    defaultMaterials: [
      { item: '0.55mm Step-Tile Aluminum Roof Sheets', quantity: 30, quality: 'Oven-Baked Colored Aluminum Sheet (Meters)', unitPrice: 7200 }
    ]
  },
  {
    id: 'pop-false-ceiling',
    title: 'POP & False Ceilings',
    category: 'Construction & Building',
    iconName: 'Square',
    defaultScope: `Erect galvanised ceiling steel channels, screw plasterboards, cast ornamental POP cornices, tape joints, and sand for recessed LED cove lighting.`,
    defaultTerms: `1. DRYING TIME: POP cast elements given full 48 hours setting before primer paint.`,
    defaultMaterials: [
      { item: 'Gypsum Plasterboard Sheets (12mm)', quantity: 25, quality: 'Moisture Resistant Ceiling Board', unitPrice: 8500 }
    ]
  },
  {
    id: 'waterproofing-specialist',
    title: 'Waterproofing & Sealing',
    category: 'Construction & Building',
    iconName: 'ShieldAlert',
    defaultScope: `Torch apply torch-on bituminous waterproofing membranes, crystalline slurry coatings on basements, flat roofs, gutters, and wet room floors.`,
    defaultTerms: `1. FLOOD TEST: Waterproofed area submerged in 50mm water for 24 hours to prove zero seepage.`,
    defaultMaterials: [
      { item: '4mm Slate Granule Torch-on Bitumen Membrane', quantity: 10, quality: 'Polyester Reinforced Membrane Roll (10m)', unitPrice: 32000 }
    ]
  },
  {
    id: 'glazier-glass',
    title: 'Glazing & Glass Installation',
    category: 'Construction & Building',
    iconName: 'Maximize2',
    defaultScope: `Install frameless glass shower enclosures, glass balustrades, storefront glass doors, and insulated double-glazed window panels.`,
    defaultTerms: `1. SAFETY GLASS: Toughened safety glass used exclusively for structural barriers.`,
    defaultMaterials: [
      { item: '12mm Toughened Clear Glass Sheet with Patch Fittings', quantity: 4, quality: 'High Transparency Architectural Safety Glass', unitPrice: 85000 }
    ]
  },
  {
    id: 'interlocking-paving',
    title: 'Paving & Landscaping',
    category: 'Construction & Building',
    iconName: 'Grid',
    defaultScope: `Excavate driveway soil, lay stone dust base course, compact, and lay 60mm/80mm interlocking concrete paving stones with edge kerbs.`,
    defaultTerms: `1. COMPACTION: Base course compacted with 5-ton plate compactor to prevent settlement ruts.`,
    defaultMaterials: [
      { item: '80mm Heavy Duty Interlocking Concrete Paving Stones', quantity: 100, quality: 'Vibrated 50N Concrete Paving Stones (Sqm)', unitPrice: 6500 }
    ]
  },
  {
    id: 'insulation-contractor',
    title: 'Thermal & Sound Insulation',
    category: 'Construction & Building',
    iconName: 'VolumeX',
    defaultScope: `Install rockwool acoustic batts, fiberglass thermal insulation rolls, or spray polyurethane foam inside drywall cavities and roof lofts.`,
    defaultTerms: `1. FIRE RATING: Insulation materials certified non-combustible Class A1 fire rated.`,
    defaultMaterials: [
      { item: 'Rockwool Acoustic Insulation Slabs (50mm)', quantity: 20, quality: 'High Density 60kg/m3 Soundproofing Rockwool', unitPrice: 14500 }
    ]
  },
  {
    id: 'demolition-contractor',
    title: 'Demolition & Site Clearance',
    category: 'Construction & Building',
    iconName: 'Trash2',
    defaultScope: `Safely demolish targeted reinforced concrete walls or structures, sort recyclable metal scrap, load rubble into tipper trucks, and leave site clean.`,
    defaultTerms: `1. ADJACENT STRUCTURE PROTECTION: Dust screens and shoring installed to protect neighboring walls.`,
    defaultMaterials: [
      { item: 'Heavy Equipment & Tipper Truck Haulage Trips', quantity: 4, quality: '20-Ton Tipper Rubble Haulage', unitPrice: 60000 }
    ]
  },

  // --- AUTOMOTIVE, MACHINERY & REPAIR (51-60) ---
  {
    id: 'auto-mechanic',
    title: 'Auto Mechanics & Engine Repair',
    category: 'Automotive & Repair',
    iconName: 'Wrench',
    defaultScope: `Perform computer diagnostic scan, replace timing belt, overhaul engine cylinder head, replace spark plugs, change synthetic oil and filters, and road test vehicle.`,
    defaultTerms: `1. GENUINE PARTS: All replacement spare parts guaranteed OEM genuine.
2. WARRANTY: 90-day warranty on installed mechanical parts and labor.`,
    defaultMaterials: [
      { item: 'OEM Engine Timing Belt & Water Pump Kit', quantity: 1, quality: 'Original Equipment Manufacturer Spec', unitPrice: 75000 },
      { item: 'Fully Synthetic 5W-30 Motor Oil Drum (5L)', quantity: 1, quality: 'API SP Certified High Mileage Oil', unitPrice: 28000 }
    ]
  },
  {
    id: 'auto-electrician',
    title: 'Auto Electrical & Diagnostics',
    category: 'Automotive & Repair',
    iconName: 'Cpu',
    defaultScope: `Diagnose CAN-bus electrical faults, repair alternator wiring, re-flash Engine Control Unit (ECU), install keyless alarm, and replace dead starter motors.`,
    defaultTerms: `1. DIAGNOSTIC REPORT: Computer diagnostic printout provided before and after electrical repair.`,
    defaultMaterials: [
      { item: 'Heavy Duty Maintenance-Free Car Battery (75Ah)', quantity: 1, quality: 'AGM Deep Cycle Automotive Battery', unitPrice: 85000 }
    ]
  },
  {
    id: 'auto-body-painter',
    title: 'Auto Body & Spray Painting',
    category: 'Automotive & Repair',
    iconName: 'Sparkles',
    defaultScope: `Pull vehicle body panel dents, fill body lines with polyester putty, prime, and spray 2K oven-baked acrylic polyurethane paint with clear coat polishing.`,
    defaultTerms: `1. COLOR MATCHING: Color matched using computer spectrophotometer.`,
    defaultMaterials: [
      { item: '2K Polyurethane Automotive Paint & Clearcoat', quantity: 1, quality: 'Oven Baked Scratch Resistant Paint Set', unitPrice: 120000 }
    ]
  },
  {
    id: 'auto-detailer',
    title: 'Auto Detailing & Ceramic Coating',
    category: 'Automotive & Repair',
    iconName: 'ShieldCheck',
    defaultScope: `Decontaminate paint, 2-stage machine paint correction to eliminate swirl marks, apply 9H ceramic coating layer on paint and glass, and deep steam clean interior.`,
    defaultTerms: `1. CURING: Vehicle must remain dry for 24 hours after ceramic coat application.`,
    defaultMaterials: [
      { item: '9H Nano Ceramic Coating Vial (50ml)', quality: 'Professional 5-Year Paint Protection Liquid', quantity: 1, unitPrice: 65000 }
    ]
  },
  {
    id: 'marine-mechanic',
    title: 'Marine Engine Repair',
    category: 'Automotive & Repair',
    iconName: 'Anchor',
    defaultScope: `Service marine outboard boat engines, replace cooling water pump impellers, flush carburetor fuel jets, replace spark plugs, and test propeller drive.`,
    defaultTerms: `1. SEA TRIAL: Engine tested under water load in marina or water tank.`,
    defaultMaterials: [
      { item: 'Marine Outboard Service Spare Kit', quantity: 1, quality: 'Yamaha/Mercury Genuine Maintenance Kit', unitPrice: 95000 }
    ]
  },
  {
    id: 'heavy-equipment-mechanic',
    title: 'Heavy Plant & Hydraulics',
    category: 'Automotive & Repair',
    iconName: 'Truck',
    defaultScope: `Replace hydraulic pump seals, rebuild excavator main control valves, re-bush boom cylinder pins, and change high pressure hydraulic fluid filters.`,
    defaultTerms: `1. HYDRAULIC PRESSURE: System relief valve calibrated to factory bar specifications.`,
    defaultMaterials: [
      { item: 'High Pressure Reinforced Hydraulic Hose (1 inch)', quantity: 10, quality: '4-Spiral Wire Reinforced Hose (Meters)', unitPrice: 18000 }
    ]
  },
  {
    id: 'motorcycle-repairer',
    title: 'Motorcycle Repair',
    category: 'Automotive & Repair',
    iconName: 'Compass',
    defaultScope: `Replace drive chain and sprockets, rebuild front fork shock absorbers, tune carburetor, change brake pads, and align motorcycle wheels.`,
    defaultTerms: `1. ROAD SAFETY: Brakes and throttle responsiveness road-tested prior to release.`,
    defaultMaterials: [
      { item: 'Heavy Duty O-Ring Drive Chain & Sprocket Set', quantity: 1, quality: 'Hardened Steel Motorcycle Drive Set', unitPrice: 22000 }
    ]
  },
  {
    id: 'tire-wheel-specialist',
    title: 'Tires & Wheel Alignment',
    category: 'Automotive & Repair',
    iconName: 'Disc',
    defaultScope: `Mount fresh tires, perform 3D laser wheel alignment, dynamic wheel balancing, and repair tubeless tire punctures.`,
    defaultTerms: `1. TORQUE SPEC: Wheel lug nuts torqued to manufacturer ft-lbs specification with calibrated torque wrench.`,
    defaultMaterials: [
      { item: 'All-Terrain SUV Tires (265/65 R17)', quantity: 4, quality: 'A-Grade Fresh Date Tread Tires', unitPrice: 110000 }
    ]
  },
  {
    id: 'air-brake-mechanic',
    title: 'Truck Air Brakes',
    category: 'Automotive & Repair',
    iconName: 'Octagon',
    defaultScope: `Overhaul heavy truck air brake valves, replace brake shoes, change air dryer cartridges, and leak test pneumatic trailer lines.`,
    defaultTerms: `1. AIR PRESSURE TEST: Brake tanks hold 100 PSI pressure for 30 minutes without pressure drop.`,
    defaultMaterials: [
      { item: 'Heavy Duty Brake Lining Shoes Set', quantity: 2, quality: 'Asbestos-Free High Friction Truck Linings', unitPrice: 48000 }
    ]
  },
  {
    id: 'small-engine-repair',
    title: 'Small Engine Repair',
    category: 'Automotive & Repair',
    iconName: 'Settings',
    defaultScope: `Service small gasoline engines on lawnmowers, water pumps, and power washers; sharpen cutting blades, replace recoil pull starter cord, and clean carburetor.`,
    defaultTerms: `1. STARTER WARRANTY: 30 days guarantee on recoil pull assembly.`,
    defaultMaterials: [
      { item: 'Small Engine Tune-Up Maintenance Set', quantity: 1, quality: 'Filters, Spark Plug & Blade Set', unitPrice: 15000 }
    ]
  },

  // --- DESIGN, CREATIVE & DIGITAL SERVICES (61-75) ---
  {
    id: 'graphic-designer',
    title: 'Graphic & Brand Design',
    category: 'Creative & Design',
    iconName: 'Feather',
    defaultScope: `Create custom visual brand identity including primary logo, secondary marks, brand color palette, typography guidelines, business cards, and social media brand templates.`,
    defaultTerms: `1. REVISIONS: Up to 3 rounds of creative feedback revisions included.
2. VECTOR SOURCE FILES: Client receives full AI, EPS, SVG, and high-res PNG export packages upon final payment clearance.`,
    defaultMaterials: [
      { item: 'Brand Guidelines PDF & Source Asset Package', quantity: 1, quality: 'Complete Vector Identity Suite', unitPrice: 250000 }
    ]
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX & Product Design',
    category: 'Creative & Design',
    iconName: 'Layout',
    defaultScope: `Conduct user research, design wireframes, interactive Figma prototypes, component design systems, and responsive screen UI layouts for web/mobile applications.`,
    defaultTerms: `1. FIGMA FILE HANDOFF: Full organized Figma file with auto-layout design system components delivered.`,
    defaultMaterials: [
      { item: 'Figma Interactive Mobile & Web Design Prototype', quantity: 1, quality: 'High-Fidelity Component System', unitPrice: 650000 }
    ]
  },
  {
    id: 'architectural-3d-visualizer',
    title: '3D Architecture & Rendering',
    category: 'Creative & Design',
    iconName: 'Box',
    defaultScope: `Convert 2D CAD floorplans into photorealistic 3D architectural exterior renderings, interior walk-through animations, and material lighting studies.`,
    defaultTerms: `1. RENDER RESOLUTION: Still images delivered in 4K resolution. Walk-through video delivered in 1080p 60fps.`,
    defaultMaterials: [
      { item: '4K Architectural Photorealistic Render Suite', quantity: 6, quality: 'Ray-Traced Photorealistic Still Renders', unitPrice: 45000 }
    ]
  },
  {
    id: 'photographer-commercial',
    title: 'Photography & Portraits',
    category: 'Creative & Design',
    iconName: 'Camera',
    defaultScope: `Provide photo shoot coverage, studio lighting setup, professional image retouching, color grading, and delivery of high-resolution digital photo gallery.`,
    defaultTerms: `1. USAGE RIGHTS: License granted for client commercial marketing use. Photographer retains portfolio display rights.`,
    defaultMaterials: [
      { item: 'Retouched High Resolution Image Files', quantity: 30, quality: 'Full Frame Retouched Commercial Photos', unitPrice: 8000 }
    ]
  },
  {
    id: 'videographer-editor',
    title: 'Video Production & Editing',
    category: 'Creative & Design',
    iconName: 'Video',
    defaultScope: `Shoot multi-camera 4K video footage, record crisp lavalier audio, edit color-graded video package with sound design, licensed music, and motion titles.`,
    defaultTerms: `1. MUSIC LICENSING: Background music licensed for commercial web broadcast.`,
    defaultMaterials: [
      { item: 'Edited 4K Commercial Video Master', quantity: 1, quality: 'ProRes / H.264 Color Graded Video Package', unitPrice: 450000 }
    ]
  },
  {
    id: 'interior-decorator',
    title: 'Interior Design & Styling',
    category: 'Creative & Design',
    iconName: 'Home',
    defaultScope: `Develop interior design mood boards, select furniture, procure decorative art pieces, coordinate paint colors, and style residential or corporate space.`,
    defaultTerms: `1. PROCUREMENT MANAGEMENT: Procurement invoice items subject to 10% management fee.`,
    defaultMaterials: [
      { item: 'Interior Styling Design Board & Procurement Package', quantity: 1, quality: 'Custom Curated Decor Selection', unitPrice: 350000 }
    ]
  },
  {
    id: 'landscape-architect',
    title: 'Landscape & Garden Design',
    category: 'Creative & Design',
    iconName: 'Sun',
    defaultScope: `Design outdoor garden layouts, select ornamental plants and lawn turf, plan outdoor lighting, stone pathways, and automated irrigation sprinklers.`,
    defaultTerms: `1. PLANT ESTABLISHMENT: 30-day care instructions provided post planting.`,
    defaultMaterials: [
      { item: 'Exotic Garden Palms & Bermuda Grass Turf', quantity: 50, quality: 'Grade A Healthy Nursery Stock (Sqm)', unitPrice: 3500 }
    ]
  },
  {
    id: 'sound-engineer-producer',
    title: 'Sound Engineering & Audio',
    category: 'Creative & Design',
    iconName: 'Music',
    defaultScope: `Record vocal tracks, mix multi-track audio session, apply EQ, compression, reverb, and master audio track to streaming loudness standards (-14 LUFS).`,
    defaultTerms: `1. REVISIONS: Up to 2 mix tweak revisions included.`,
    defaultMaterials: [
      { item: 'Mastered Audio Files (WAV / MP3 Package)', quantity: 1, quality: '24-bit 96kHz Uncompressed Master', unitPrice: 150000 }
    ]
  },
  {
    id: 'copywriter-content-creator',
    title: 'Copywriting & Content',
    category: 'Creative & Design',
    iconName: 'FileText',
    defaultScope: `Write compelling website landing page copy, sales email sequences, product descriptions, and brand press releases engineered for conversions.`,
    defaultTerms: `1. ORIGINALITY GUARANTEE: All copy written 100% original without plagiarism.`,
    defaultMaterials: [
      { item: 'Sales Copywriting Document Package', quantity: 1, quality: 'Conversion Focused Written Content Suite', unitPrice: 180000 }
    ]
  },
  {
    id: 'illustrator-animator',
    title: 'Illustration & Animation',
    category: 'Creative & Design',
    iconName: 'Film',
    defaultScope: `Create custom character illustrations, storyboards, and 60-second animated explainer video with voiceover sync and sound effects.`,
    defaultTerms: `1. STORYBOARD APPROVAL: Storyboard approved prior to keyframe animation phase.`,
    defaultMaterials: [
      { item: 'Full HD Animated Explainer Video', quantity: 1, quality: 'Custom 2D Vector Animation Package', unitPrice: 380000 }
    ]
  },
  {
    id: 'signage-billboard-maker',
    title: 'Signage & Neon Fabrication',
    category: 'Creative & Design',
    iconName: 'Tv',
    defaultScope: `Fabricate 3D acrylic illuminated channel letters, outdoor LED lightbox signage, or custom flex neon signboards for storefront branding.`,
    defaultTerms: `1. POWER TRANSFORMER: Waterproof 12V LED power supply included.`,
    defaultMaterials: [
      { item: '3D Acrylic Illuminated Channel Letters Set', quantity: 1, quality: 'IP67 Outdoor Waterproof LED Sign', unitPrice: 280000 }
    ]
  },
  {
    id: 'event-decorator',
    title: 'Event & Wedding Decor',
    category: 'Creative & Design',
    iconName: 'Sparkles',
    defaultScope: `Transform event hall with custom floral backdrop walls, ambient LED uplighting, ceiling drapery, banquet table linens, and VIP stage furniture.`,
    defaultTerms: `1. EVENT TIMELINE: Setup completed 2 hours prior to guest arrival time.`,
    defaultMaterials: [
      { item: 'Luxury Floral & LED Event Decor Rental Package', quantity: 1, quality: 'Full Venue Stage & Table Styling', unitPrice: 850000 }
    ]
  },
  {
    id: '3d-printing-prototyper',
    title: '3D Printing & Prototyping',
    category: 'Creative & Design',
    iconName: 'Box',
    defaultScope: `Convert 3D CAD files into physical plastic/resin prototypes using SLA/FDM 3D printing technology with post-processing support removal and painting.`,
    defaultTerms: `1. TOLERANCE: Print dimensions accurate to +/- 0.2mm.`,
    defaultMaterials: [
      { item: 'High Precision Resin / PETG 3D Printed Parts', quantity: 5, quality: 'Durable High Resolution SLA Print', unitPrice: 25000 }
    ]
  },
  {
    id: 'voiceover-artist',
    title: 'Voiceover & Narration',
    category: 'Creative & Design',
    iconName: 'Mic',
    defaultScope: `Record professional broadcast-quality voiceover audio in broadcast studio for commercials, documentaries, or corporate training modules.`,
    defaultTerms: `1. SCRIPT EDITS: Script changes requested after recording incur re-recording fee.`,
    defaultMaterials: [
      { item: 'Edited Broadcast Voiceover Audio File', quantity: 1, quality: 'Studio Clean 24-bit WAV Audio', unitPrice: 95000 }
    ]
  },
  {
    id: 'package-designer',
    title: 'Packaging & Print Design',
    category: 'Creative & Design',
    iconName: 'Package',
    defaultScope: `Design custom product packaging boxes, labels, pouch bags, and press-ready vector dielines for manufacturing print houses.`,
    defaultTerms: `1. DIELINE ACCURACY: Dieline dimensions matched to client bottle or box dimensions.`,
    defaultMaterials: [
      { item: 'Press-Ready Packaging Vector File Suite', quantity: 1, quality: 'CMYK High Resolution Print Files', unitPrice: 220000 }
    ]
  },

  // --- IT, SOFTWARE & TECHNICAL SERVICES (76-85) ---
  {
    id: 'web-developer-fullstack',
    title: 'Web & Software Development',
    category: 'IT & Software',
    iconName: 'Code',
    defaultScope: `Develop custom web application with TypeScript, React, Tailwind CSS, Express backend server, database schemas, secure user authentication, and API endpoints.`,
    defaultTerms: `1. SOURCE CODE OWNERSHIP: Intellectual property rights transfer to Client upon 100% final invoice payment.
2. WARRANTY: 60-day post-launch bug fixing warranty.`,
    defaultMaterials: [
      { item: 'Custom Source Code Repository & Documentation', quantity: 1, quality: 'Clean Tested TypeScript/React Codebase', unitPrice: 1500000 },
      { item: 'Cloud Server Infrastructure Setup', quantity: 1, quality: 'SSL, Domain & Production Container Config', unitPrice: 150000 }
    ]
  },
  {
    id: 'mobile-app-developer',
    title: 'Mobile App Development',
    category: 'IT & Software',
    iconName: 'Smartphone',
    defaultScope: `Build cross-platform React Native / Flutter mobile application with push notifications, offline storage, payment gateway integration, and App Store submission.`,
    defaultTerms: `1. STORE APPROVAL: Developer assists until initial App Store / Google Play review approval.`,
    defaultMaterials: [
      { item: 'Production Mobile App Package (IPA & APK)', quantity: 1, quality: 'iOS & Android Store Ready Builds', unitPrice: 2200000 }
    ]
  },
  {
    id: 'cybersecurity-consultant',
    title: 'Cybersecurity & Auditing',
    category: 'IT & Software',
    iconName: 'ShieldAlert',
    defaultScope: `Perform vulnerability assessment and penetration testing (VAPT) on web applications, servers, and network APIs; provide executive remediation report.`,
    defaultTerms: `1. AUTHORIZATION: Client authorizes controlled simulated cyber attacks within agreed IP range.`,
    defaultMaterials: [
      { item: 'Vulnerability Assessment & Remediation Report', quantity: 1, quality: 'ISO 27001 Compliant Audit Document', unitPrice: 850000 }
    ]
  },
  {
    id: 'network-engineer',
    title: 'Network & Server Cabling',
    category: 'IT & Software',
    iconName: 'Server',
    defaultScope: `Lay Cat6 network trunking cables, terminate patch panels, configure managed network switches, Wi-Fi access points, and install server rack cabinet.`,
    defaultTerms: `1. CABLE TESTING: Fluke cable certification test report provided for every network drop point.`,
    defaultMaterials: [
      { item: 'Cat6 Shielded Pure Copper Network Cable Box (305m)', quantity: 3, quality: 'Gigabit Certified Network Cable', unitPrice: 58000 },
      { item: '24-Port Managed Gigabit PoE Switch', quantity: 1, quality: 'Enterprise Managed Switch Box', unitPrice: 185000 }
    ]
  },
  {
    id: 'devops-cloud-architect',
    title: 'Cloud & DevOps Infrastructure',
    category: 'IT & Software',
    iconName: 'Cloud',
    defaultScope: `Configure Docker containerization, Kubernetes clusters, CI/CD automated deployment pipelines, and auto-scaling cloud database clusters.`,
    defaultTerms: `1. UPTIME TARGET: Infrastructure configured for 99.9% uptime SLA target.`,
    defaultMaterials: [
      { item: 'Automated CI/CD Pipeline & Cloud Config Script Suite', quantity: 1, quality: 'Infrastructure-as-Code Terraform Scripts', unitPrice: 750000 }
    ]
  },
  {
    id: 'seo-digital-marketer',
    title: 'SEO & Digital Marketing',
    category: 'IT & Software',
    iconName: 'TrendingUp',
    defaultScope: `Execute technical website SEO audit, keyword optimization, Google Business profile enhancement, and manage pay-per-click ad campaign across search networks.`,
    defaultTerms: `1. PERFORMANCE METRICS: Monthly ranking analytics report delivered to client.`,
    defaultMaterials: [
      { item: 'Monthly SEO Audit & Campaign Execution', quantity: 1, quality: 'Comprehensive Traffic & Backlink Growth Package', unitPrice: 280000 }
    ]
  },
  {
    id: 'database-administrator',
    title: 'Database & SQL Management',
    category: 'IT & Software',
    iconName: 'Database',
    defaultScope: `Optimize SQL query performance, configure automated database backups, clean data duplicates, and execute zero-downtime data migration.`,
    defaultTerms: `1. DATA BACKUP: Full encrypted database snapshot backed up before schema migration.`,
    defaultMaterials: [
      { item: 'Database Migration & Optimization Package', quantity: 1, quality: 'Encrypted SQL Dump & Backup Scripts', unitPrice: 450000 }
    ]
  },
  {
    id: 'e-commerce-specialist',
    title: 'E-Commerce Store Setup',
    category: 'IT & Software',
    iconName: 'ShoppingCart',
    defaultScope: `Setup e-commerce online store with product inventory, payment gate integrations, shipping cost calculator, and abandoned cart email automation.`,
    defaultTerms: `1. PAYMENT GATEWAY: Client provides API merchant credentials for live activation.`,
    defaultMaterials: [
      { item: 'Custom E-Commerce Portal Setup', quantity: 1, quality: 'Turnkey Online Store Suite', unitPrice: 480000 }
    ]
  },
  {
    id: 'automation-ai-developer',
    title: 'AI & Workflow Automation',
    category: 'IT & Software',
    iconName: 'Cpu',
    defaultScope: `Develop custom Gemini AI workflows, API integrations, automated email response bot, and business document processing automation.`,
    defaultTerms: `1. API COST: Third party AI model API token costs paid directly by client account.`,
    defaultMaterials: [
      { item: 'Custom AI Automation Agent Package', quantity: 1, quality: 'Production Ready API Bot Suite', unitPrice: 600000 }
    ]
  },
  {
    id: 'data-analyst',
    title: 'Data Analytics & BI',
    category: 'IT & Software',
    iconName: 'BarChart',
    defaultScope: `Aggregate raw business sales data, build interactive executive PowerBI / Metabase dashboards, and produce predictive revenue forecast models.`,
    defaultTerms: `1. DATA CONFIDENTIALITY: Strict NDA applies to all shared financial data.`,
    defaultMaterials: [
      { item: 'Interactive Business Intelligence Dashboard Suite', quantity: 1, quality: 'Real-Time Data Analytics System', unitPrice: 380000 }
    ]
  },

  // --- PERSONAL, EVENTS & FOOD SERVICES (86-95) ---
  {
    id: 'catering-chef',
    title: 'Catering & Culinary Services',
    category: 'Food & Events',
    iconName: 'Coffee',
    defaultScope: `Provide full catering food service for event guests including gourmet multi-course buffet meals, cocktail canapés, serving staff, cutlery, and warming chaffing dishes.`,
    defaultTerms: `1. GUEST COUNT: Final guest head count confirmed 5 days prior to event date.
2. FOOD SAFETY: All meals prepared following strict HACCP food hygiene guidelines.`,
    defaultMaterials: [
      { item: 'Gourmet Banquet Food Plates (Per Guest)', quantity: 100, quality: 'Multi-Course Buffet Menu Selection', unitPrice: 12000 },
      { item: 'Chaffing Dishes, Cutlery & Waiter Staff Service', quantity: 1, quality: 'Full Uniformed Catering Crew Package', unitPrice: 150000 }
    ]
  },
  {
    id: 'baker-cake-artist',
    title: 'Baking & Custom Cakes',
    category: 'Food & Events',
    iconName: 'Gift',
    defaultScope: `Bake, sculpt, and decorate 4-tier luxury wedding cake with hand-crafted sugar flowers, gourmet fillings, and deliver in refrigerated transport to venue.`,
    defaultTerms: `1. REFRIGERATION: Cake must be displayed in air-conditioned hall away from direct sunlight.`,
    defaultMaterials: [
      { item: 'Multi-Tier Sculpted Custom Cake', quantity: 1, quality: '4-Tier Fondant & Sugar Flower Wedding Cake', unitPrice: 350000 }
    ]
  },
  {
    id: 'hairdresser-hairstylist',
    title: 'Hair Styling & Bridal Hair',
    category: 'Beauty & Personal',
    iconName: 'Smile',
    defaultScope: `Provide bridal hair styling, wig ventilation, custom hair coloring, extensions installation, and touch-up services for wedding party.`,
    defaultTerms: `1. TRIAL SESSION: Includes one pre-wedding trial hair styling session.`,
    defaultMaterials: [
      { item: 'Virgin Human Hair Bundle & Wig Unit', quantity: 2, quality: '100% Unprocessed Grade 12A Human Hair', unitPrice: 85000 }
    ]
  },
  {
    id: 'barber-grooming',
    title: 'Barbering & Grooming',
    category: 'Beauty & Personal',
    iconName: 'Scissors',
    defaultScope: `Provide VIP grooming services including precision haircut, beard trimming, hot towel facial massage, hair dye, and razor line finish.`,
    defaultTerms: `1. HYGIENE: Single-use sterilized razor blades used for every client.`,
    defaultMaterials: [
      { item: 'Executive Grooming & Beard Care Package', quantity: 1, quality: 'Premium Organic Oils & Sterilized Blades', unitPrice: 25000 }
    ]
  },
  {
    id: 'makeup-artist',
    title: 'Makeup Artistry (MUA)',
    category: 'Beauty & Personal',
    iconName: 'Sparkles',
    defaultScope: `Apply HD airbrush bridal makeup, mink eyelash installation, contouring, and touch-ups throughout photoshoot event duration.`,
    defaultTerms: `1. SKIN ALLERGIES: Client must disclose skin sensitivities or allergies prior to application.`,
    defaultMaterials: [
      { item: 'HD Luxury Cosmetics Application Package', quantity: 1, quality: 'Dermablend & MAC Pro Makeup Application', unitPrice: 120000 }
    ]
  },
  {
    id: 'event-planner',
    title: 'Event Planning & Coordination',
    category: 'Food & Events',
    iconName: 'Calendar',
    defaultScope: `Coordinate event logistics, manage vendor contracts, oversee hall setup, manage event ushering staff, and run full event execution schedule.`,
    defaultTerms: `1. VENDOR PAYMENTS: Vendor fees paid directly by client according to vendor deadlines.`,
    defaultMaterials: [
      { item: 'Full Event Management & Ushering Coordination', quantity: 1, quality: 'Turnkey Event Logistics Package', unitPrice: 650000 }
    ]
  },
  {
    id: 'fitness-trainer',
    title: 'Fitness & Personal Training',
    category: 'Beauty & Personal',
    iconName: 'Activity',
    defaultScope: `Conduct 12-week one-on-one personal fitness training sessions, body composition analysis, custom workout plans, and daily meal nutrition tracking.`,
    defaultTerms: `1. CANCELLATION: 24-hour advance notice required to reschedule missed training sessions.`,
    defaultMaterials: [
      { item: '12-Week Personal Fitness & Nutrition Coaching', quantity: 1, quality: '36 Dedicated 1-on-1 Training Sessions', unitPrice: 300000 }
    ]
  },
  {
    id: 'pet-groomer',
    title: 'Pet Grooming & Care',
    category: 'Beauty & Personal',
    iconName: 'Heart',
    defaultScope: `Provide mobile pet grooming including flea bath, coat blow dry, de-shedding brushing, nail trimming, ear cleaning, and sanitary trim.`,
    defaultTerms: `1. VACCINATIONS: Pets must have up-to-date rabies vaccination records.`,
    defaultMaterials: [
      { item: 'Full Pet Spa & Medicated Grooming Wash', quantity: 1, quality: 'Anti-Flea Medicated Organic Shampoo Wash', unitPrice: 20000 }
    ]
  },
  {
    id: 'dj-sound-entertainer',
    title: 'DJ & Sound Entertainment',
    category: 'Food & Events',
    iconName: 'Disc',
    defaultScope: `Provide high powered active PA speakers, wireless microphones, DJ mixing console, lights, and 6 hours of custom music DJ entertainment.`,
    defaultTerms: `1. POWER SUPPLY: Client must guarantee clean generator power source at venue.`,
    defaultMaterials: [
      { item: '4000W Active PA Sound System & DJ Package', quantity: 1, quality: 'Pro Dual 18-Inch Subwoofers & Line Arrays', unitPrice: 280000 }
    ]
  },
  {
    id: 'personal-shopper',
    title: 'Fashion Styling & Shopping',
    category: 'Beauty & Personal',
    iconName: 'ShoppingBag',
    defaultScope: `Source, purchase, and deliver curated wardrobe pieces, luxury designer accessories, and outfit styling for VIP events.`,
    defaultTerms: `1. RECEIPT REIMBURSEMENT: Clothing item purchase receipts billed directly to client.`,
    defaultMaterials: [
      { item: 'Wardrobe Styling & Procurement Service Fee', quantity: 1, quality: 'Curated Fashion Selection Package', unitPrice: 150000 }
    ]
  },

  // --- PROFESSIONAL, AGRICULTURE & LOGISTICS (96-100+) ---
  {
    id: 'cleaner-commercial',
    title: 'Cleaning & Fumigation',
    category: 'Professional & Business',
    iconName: 'CheckCircle2',
    defaultScope: `Perform deep post-construction cleaning, floor scrubbing, glass window washing, carpet extraction, and chemical pest fumigation.`,
    defaultTerms: `1. SAFETY DATA: All chemical cleaning and pest control agents are EPA approved non-toxic once dry.`,
    defaultMaterials: [
      { item: 'Industrial Floor Cleaning Chemicals & Fumigation Pack', quantity: 1, quality: 'Eco-Friendly Disinfectant Drum', unitPrice: 75000 }
    ]
  },
  {
    id: 'freight-logistics',
    title: 'Freight Forwarding & Logistics',
    category: 'Professional & Business',
    iconName: 'Truck',
    defaultScope: `Handle customs clearance, port documentation, container offloading, duty payment assessment, and bonded truck transport to destination warehouse.`,
    defaultTerms: `1. DEMURRAGE: Demurrage charges incurred due to customs document delays billed at cost.`,
    defaultMaterials: [
      { item: 'Customs Duty Clearing & Port Logistics Package', quantity: 1, quality: 'Complete Freight Clearance Handling', unitPrice: 650000 }
    ]
  },
  {
    id: 'farm-manager-agronomist',
    title: 'Farming & Agronomy',
    category: 'Professional & Business',
    iconName: 'Sun',
    defaultScope: `Oversee land clearing, soil testing, automated drip irrigation setup, crop planting schedule, organic fertilizer application, and harvest yield management.`,
    defaultTerms: `1. HARVEST YIELD: Crop yield forecasts based on standard climate weather conditions.`,
    defaultMaterials: [
      { item: 'NPK Fertilizer & Organic Crop Soil Boosters (50kg)', quantity: 20, quality: 'High Nitrogen Balanced Crop Fertilizer', unitPrice: 24000 }
    ]
  },
  {
    id: 'security-guard-service',
    title: 'Security Guard Services',
    category: 'Professional & Business',
    iconName: 'Shield',
    defaultScope: `Deploy vetted, uniformed, and trained security personnel for 24/7 site surveillance, access logging, perimeter patrols, and emergency response.`,
    defaultTerms: `1. VETTING: All security personnel background checked with law enforcement.`,
    defaultMaterials: [
      { item: 'Uniformed Security Guard Patrols (Monthly)', quantity: 4, quality: 'Trained & Vetted Static Security Guards', unitPrice: 120000 }
    ]
  },
  {
    id: 'real-estate-surveyor',
    title: 'Land Surveying & Valuation',
    category: 'Professional & Business',
    iconName: 'Compass',
    defaultScope: `Conduct GPS cadastral land boundary survey, plant boundary beacon pillars, lodge official survey plan at land registry, and produce property valuation report.`,
    defaultTerms: `1. BEACON RECORDING: Survey pillars lodged officially with Surveyor General's office.`,
    defaultMaterials: [
      { item: 'Concrete Boundary Beacon Pillars & Lodgement Fee', quantity: 4, quality: 'Surveyor General Certified Pillars', unitPrice: 45000 }
    ]
  },

  // --- COMPANY & WORKER EMPLOYMENT AGREEMENTS ---
  {
    id: 'emp-full-time-staff',
    title: 'Full-Time Company Employment & Salary Agreement',
    category: 'Company & Worker Employment',
    contractType: 'worker_employment',
    iconName: 'Briefcase',
    defaultScope: `1. POSITION & DUTIES: The Employee agrees to serve in the designated position, diligently performing all assigned workplace responsibilities, fulfilling company operational standards, and reporting directly to the designated department head or supervisor.
2. WORKING HOURS: Official working hours are 8:00 AM to 5:00 PM, Monday through Friday (40 hours per week), with a one-hour lunch intermission.
3. PERFORMANCE STANDARDS: Employee commits to maintaining professional decorum, punctuality, active teamwork, and high work quality according to established company key performance indicators (KPIs).`,
    defaultTerms: `1. SALARY & REMUNERATION: The Company agrees to pay the Employee the agreed monthly base salary on or before the last working day of each calendar month, subject to statutory deductions (TAX, Pension, NHF where applicable).
2. PROBATIONARY PERIOD: Employment begins with an initial 3-month probation period. Confirmation of permanent employment is subject to satisfactory performance appraisal.
3. CONFIDENTIALITY & NON-DISCLOSURE: The Employee shall not disclose, duplicate, or misuse any proprietary company trade secrets, customer databases, pricing, financial records, or operational methods during or after employment.
4. CODE OF CONDUCT & DISCIPLINE: Employee agrees to abide by company safety policies, anti-harassment regulations, and attendance requirements. Gross misconduct constitutes grounds for immediate summary dismissal.
5. TERMINATION & NOTICE: Following probation, either party may terminate this agreement by providing 30 days written notice or by paying one month base salary in lieu of notice.
6. INTELLECTUAL PROPERTY: All works, systems, code, designs, and materials created by the Employee during working hours or using company resources remain the exclusive property of the Company.`,
    defaultMaterials: [],
    defaultSalaryDetails: {
      baseSalary: 180000,
      paymentFrequency: 'monthly',
      employmentType: 'full_time',
      jobTitle: 'Operations & Administrative Specialist',
      department: 'General Operations',
      probationPeriod: '3 Months',
      workingHours: 'Mon - Fri, 8:00 AM - 5:00 PM (40 hrs/wk)',
      allowances: 'Transport subsidy + Group health coverage',
      leaveDays: '21 Days Paid Annual Leave',
      noticePeriod: '30 Days Written Notice'
    }
  },
  {
    id: 'emp-factory-workshop-worker',
    title: 'Factory & Workshop Worker Employment Contract',
    category: 'Company & Worker Employment',
    contractType: 'worker_employment',
    iconName: 'Wrench',
    defaultScope: `1. WORKSHOP DUTIES: Execute fabrication, assembly line duties, machine operation, safety protocol adherence, raw material handling, and daily production batch quota fulfillment.
2. SHIFTS & SCHEDULE: Standard workshop shift hours: 7:30 AM to 4:30 PM (Monday to Friday, Saturday alternate half-day).
3. SAFETY COMPLIANCE: Obligatory usage of company-provided Personal Protective Equipment (PPE) including safety boots, goggles, gloves, and ear protection at all times on the workshop floor.`,
    defaultTerms: `1. WAGE & OVERTIME TERMS: The Worker shall receive the designated monthly wage disbursed monthly. Approved overtime hours worked beyond 40 hours per week are compensated at 1.5x the standard hourly wage rate.
2. TOOL & MACHINE CARE: Worker is accountable for proper care, clean storage, and immediate defect reporting of assigned workshop machinery and precision tools.
3. SAFETY & ZERO-TOLERANCE: Operating machinery under the influence of alcohol, drugs, or without required safety gear results in immediate suspension.
4. PROBATION & NOTICE: 1-month probation. 14 days written notice required for termination by either party.
5. WORKPLACE INJURY & FIRST AID: Employer provides on-site first aid facilities and statutory workmen's compensation insurance for on-the-job incidents.`,
    defaultMaterials: [],
    defaultSalaryDetails: {
      baseSalary: 120000,
      paymentFrequency: 'monthly',
      employmentType: 'full_time',
      jobTitle: 'Senior Workshop Craftsman / Machine Operator',
      department: 'Production & Fabrication',
      probationPeriod: '1 Month',
      workingHours: 'Mon - Fri, 7:30 AM - 4:30 PM (40 hrs/wk)',
      allowances: 'Safety hazard allowance + Overtime rate 1.5x',
      leaveDays: '15 Days Annual Leave',
      noticePeriod: '14 Days Written Notice'
    }
  },
  {
    id: 'emp-sales-marketing-executive',
    title: 'Sales Executive & Commission Agreement',
    category: 'Company & Worker Employment',
    contractType: 'worker_employment',
    iconName: 'TrendingUp',
    defaultScope: `1. SALES RESPONSIBILITIES: Proactively prospect commercial leads, conduct product demonstrations, negotiate client contracts, achieve monthly sales quotas, and maintain accurate CRM client records.
2. TERRITORY & REPORTING: Assigned territory coverage with weekly pipeline reviews submitted to the Head of Sales.`,
    defaultTerms: `1. BASE SALARY + COMMISSION: Company pays a fixed monthly base salary plus a 5% to 10% commission on all cleared invoice revenues generated by the Executive.
2. COMMISSION DISBURSEMENT: Commissions are calculated on the 1st of each month and paid alongside regular salary once client payments have cleared the bank.
3. CLIENT NON-SOLICITATION: For 12 months following departure from the company, the Executive shall not solicit or divert any company clients, accounts, or leads.
4. EXPENSE REIMBURSEMENT: Approved business travel, client entertainment, and logistics costs reimbursed upon submission of official receipts.`,
    defaultMaterials: [],
    defaultSalaryDetails: {
      baseSalary: 150000,
      paymentFrequency: 'monthly',
      employmentType: 'full_time',
      jobTitle: 'Commercial Sales Executive',
      department: 'Business Development & Sales',
      probationPeriod: '3 Months',
      workingHours: 'Mon - Fri, 8:30 AM - 5:00 PM',
      allowances: 'Transport logistics stipend + 7.5% Closed Sales Commission',
      leaveDays: '20 Days Annual Leave',
      noticePeriod: '30 Days Written Notice'
    }
  },
  {
    id: 'emp-driver-logistics-officer',
    title: 'Company Driver & Fleet Logistics Staff Agreement',
    category: 'Company & Worker Employment',
    contractType: 'worker_employment',
    iconName: 'Truck',
    defaultScope: `1. DRIVING DUTIES: Safe transport of company personnel, client goods, inventory deliveries, and VIP pickups using assigned company vehicles.
2. VEHICLE INSPECTION: Daily pre-trip inspection of vehicle fluids (engine oil, coolant, brake fluid), tire pressure, battery, and bodywork cleanliness.
3. LOGBOOK RECORDING: Accurate recording of daily trip mileage, fuel purchase receipts, and delivery manifest signatures.`,
    defaultTerms: `1. SALARY & FUEL ADVANCE: Monthly salary paid on the 28th of every month. Company provides dedicated fuel credit card or approved weekly fuel disbursements.
2. TRAFFIC LAWS & FINES: Driver must maintain a valid commercial driving license. Traffic violations and fines caused by reckless driving or illegal parking are the personal liability of the driver.
3. VEHICLE CARE & NO UNAUTHORIZED USE: Company vehicles may not be used for personal errands or unauthorized third-party ride-hailing services.
4. NOTICE & TERMINATION: 14 days written notice for resignation or termination.`,
    defaultMaterials: [],
    defaultSalaryDetails: {
      baseSalary: 110000,
      paymentFrequency: 'monthly',
      employmentType: 'full_time',
      jobTitle: 'Corporate Fleet Driver & Logistics Officer',
      department: 'Logistics & Transport',
      probationPeriod: '1 Month',
      workingHours: 'Mon - Sat, 7:00 AM - 6:00 PM',
      allowances: 'Out-of-station trip allowance + Overtime bonus',
      leaveDays: '14 Days Annual Leave',
      noticePeriod: '14 Days Written Notice'
    }
  },
  {
    id: 'emp-security-guard-contract',
    title: 'Security Personnel & Facility Guard Agreement',
    category: 'Company & Worker Employment',
    contractType: 'worker_employment',
    iconName: 'Shield',
    defaultScope: `1. SECURITY DUTIES: Continuous access control, visitor identification logging, vehicle searching, CCTV monitor surveillance, and perimeter physical inspection.
2. INCIDENT REPORTING: Immediate logging and supervisor notification of any suspicious activities, unauthorized trespass, or safety hazards.`,
    defaultTerms: `1. SALARY DISBURSEMENT: Guaranteed monthly remuneration disbursed monthly without unauthorized deductions.
2. POST DISCIPLINE: Leaving security post unattended or sleeping on duty constitutes severe breach subject to instant termination.
3. UNIFORM & EQUIPMENT: Company issues 2 sets of uniforms, flashlight, communication radio, and baton. Items must be returned in good condition upon separation.`,
    defaultMaterials: [],
    defaultSalaryDetails: {
      baseSalary: 95000,
      paymentFrequency: 'monthly',
      employmentType: 'full_time',
      jobTitle: 'Facility Security Officer',
      department: 'Corporate Security',
      probationPeriod: '1 Month',
      workingHours: '12-Hour Rotating Shift Schedule (Day/Night)',
      allowances: 'Night shift allowance + Uniform maintenance allowance',
      leaveDays: '14 Days Annual Leave',
      noticePeriod: '14 Days Written Notice'
    }
  },
  {
    id: 'emp-apprentice-trainee-stipend',
    title: 'Apprenticeship & Trainee Stipend Agreement',
    category: 'Company & Worker Employment',
    contractType: 'worker_employment',
    iconName: 'GraduationCap',
    defaultScope: `1. APPRENTICESHIP TRAINING: Undergo structured vocational training, mastering practical workshop trade skills under the direct mentorship of senior master craftsmen.
2. PRACTICAL PARTICIPATION: Assist with workshop setup, measuring, tooling, basic fabrication, and workshop tidiness.`,
    defaultTerms: `1. MONTHLY LEARNING STIPEND: Company provides a monthly training stipend to support transport and living upkeep.
2. DURATION & CERTIFICATION: Program duration is 12 months. Upon successful completion and skill assessment, the Company will award a Master Artisan Certificate of Competence.
3. DEDICATION & PUNCTUALITY: Trainee agrees to attend daily training sessions with dedication and respect for workshop health and safety protocols.`,
    defaultMaterials: [],
    defaultSalaryDetails: {
      baseSalary: 60000,
      paymentFrequency: 'monthly',
      employmentType: 'apprentice',
      jobTitle: 'Vocational Trade Apprentice / Trainee',
      department: 'Artisan Workshop Training',
      probationPeriod: '1 Month',
      workingHours: 'Mon - Fri, 8:30 AM - 4:30 PM',
      allowances: 'Monthly transport stipend + Certificate of Completion',
      leaveDays: '10 Days Training Break',
      noticePeriod: '7 Days Written Notice'
    }
  },

  // --- CORPORATE & B2B COMMERCIAL CONTRACTS ---
  {
    id: 'biz-vendor-supply-contract',
    title: 'Corporate Vendor & Commercial Supply Agreement',
    category: 'Corporate B2B Contracts',
    contractType: 'business',
    iconName: 'Building',
    defaultScope: `1. SUPPLY SPECIFICATIONS: Supplier agrees to supply and deliver high-grade industrial materials, office supplies, or commercial equipment meeting agreed technical specifications and batch volumes.
2. DELIVERY SCHEDULE: Shipments delivered to Buyer designated warehouse on or before scheduled delivery dates with accompanying waybills and quality inspection certificates.`,
    defaultTerms: `1. COMMERCIAL PRICING & INVOICING: Buyer agrees to settle verified supplier invoices within Net-30 days of goods delivery and warehouse inspection sign-off.
2. DEFECTIVE GOODS & REJECTION: Buyer reserves the right to reject non-conforming or damaged batches within 7 business days. Supplier must replace defective items within 5 business days at supplier expense.
3. PRICE STABILITY: Agreed unit prices remain fixed for the duration of this purchase agreement without unilateral price escalations.
4. FORCE MAJEURE: Neither party is liable for delivery delays resulting from acts of God, port embargoes, or government trade restrictions.`,
    defaultMaterials: [
      { item: 'Bulk Commercial Supply Order Batch A', quantity: 1, quality: 'ISO 9001 Certified Commercial Grade Supplies', unitPrice: 850000 }
    ]
  },
  {
    id: 'biz-service-level-agreement',
    title: 'Corporate Service Level Agreement (SLA) & Retainer',
    category: 'Corporate B2B Contracts',
    contractType: 'business',
    iconName: 'ShieldCheck',
    defaultScope: `1. SCOPE OF SERVICES: Provider agrees to deliver 24/7 technical system maintenance, scheduled preventative servicing, cloud infrastructure monitoring, and priority emergency troubleshooting for Client company facilities.
2. RESPONSE TIME GUARANTEE: Critical system outages acknowledged within 30 minutes and on-site/remote remediation initiated within 2 hours.`,
    defaultTerms: `1. MONTHLY CORPORATE RETAINER: Client pays an agreed monthly retainer fee payable in advance at the start of each service cycle.
2. PENALTY FOR SLA DOWNTIME: If response times exceed 4 hours without justification, a 5% credit is deducted from the subsequent month billing.
3. CONFIDENTIALITY: Both corporations agree to strict non-disclosure regarding internal IT infrastructure and proprietary business workflows.`,
    defaultMaterials: [
      { item: 'Monthly Corporate IT & Engineering Maintenance Retainer', quantity: 1, quality: 'Tier-1 SLA Priority Corporate Support Package', unitPrice: 350000 }
    ]
  }
];

/**
 * Find occupation definition by id or title search
 */
export function findOccupation(query: string): OccupationDefinition | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();
  return OCCUPATIONS_DATABASE.find(
    o => o.id.toLowerCase() === q || o.title.toLowerCase().includes(q)
  );
}
