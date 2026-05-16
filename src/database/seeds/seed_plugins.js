/**
 * Seed: Register available industry plugins
 * Run: node src/database/seeds/seed_plugins.js
 */
require('dotenv').config();
const sequelize = require('../../config/database');
const { DataTypes } = require('sequelize');

const Plugin = sequelize.define('Plugin', {
  id:             { type: DataTypes.STRING(50), primaryKey: true },
  name:           DataTypes.STRING(100),
  description:    DataTypes.TEXT,
  icon:           DataTypes.STRING(50),
  color:          DataTypes.STRING(20),
  version:        DataTypes.STRING(20),
  category:       DataTypes.STRING(50),
  author:         DataTypes.STRING(100),
  is_premium:     DataTypes.BOOLEAN,
  config_schema:  DataTypes.JSON,
  product_fields: DataTypes.JSON,
  validators:     DataTypes.JSON,
}, { tableName: 'plugins', timestamps: true, updatedAt: false, paranoid: false });

const PLUGINS = [
  {
    id: 'jewellery',
    name: 'Jewellery & Diamonds',
    description: 'Metal type, purity, karat, gemstone details, certifications (GIA/IGI/SGL), making charges, gross/net weight, old gold exchange.',
    icon: 'Gem',
    color: 'amber',
    version: '1.0.0',
    category: 'industry',
    author: 'KenTech Global',
    is_premium: false,
    config_schema: {
      default_metal: { type: 'select', options: ['gold','silver','platinum','rose_gold','white_gold'], default: 'gold' },
      default_purity: { type: 'select', options: ['24K','22K','18K','14K'], default: '18K' },
      enable_certification: { type: 'boolean', default: true },
      enable_old_gold: { type: 'boolean', default: false },
    },
    product_fields: [
      { key: 'metal_type',   label: 'Metal type',   type: 'select', options: ['gold','silver','platinum','rose_gold','white_gold','palladium'], required: true, group: 'Metal & weight' },
      { key: 'purity',       label: 'Purity / Karat', type: 'select', options: ['24K','22K','18K','14K','950','925','other'], required: true, group: 'Metal & weight' },
      { key: 'gross_weight', label: 'Gross weight (g)', type: 'number', step: 0.001, required: true, group: 'Metal & weight' },
      { key: 'net_weight',   label: 'Net weight (g)',   type: 'number', step: 0.001, required: false, group: 'Metal & weight' },
      { key: 'making_charges',    label: 'Making charges',     type: 'number', step: 0.01, group: 'Pricing' },
      { key: 'making_charge_pct', label: 'Making charge (%)',  type: 'number', step: 0.01, group: 'Pricing' },
      { key: 'gemstone_type',     label: 'Gemstone type',      type: 'text', group: 'Gemstone' },
      { key: 'gemstone_carat',    label: 'Carat weight',       type: 'number', step: 0.01, group: 'Gemstone' },
      { key: 'gemstone_clarity',  label: 'Clarity',  type: 'select', options: ['FL','IF','VVS1','VVS2','VS1','VS2','SI1','SI2','I1','I2','I3'], group: 'Gemstone' },
      { key: 'gemstone_cut',      label: 'Cut',      type: 'select', options: ['Excellent','Very Good','Good','Fair','Poor'], group: 'Gemstone' },
      { key: 'gemstone_color',    label: 'Color grade', type: 'text', group: 'Gemstone' },
      { key: 'certification_body', label: 'Certification', type: 'multiselect', options: ['GIA','IGI','SGL','HRD','AGS'], group: 'Certification' },
      { key: 'certificate_number', label: 'Certificate #', type: 'text', group: 'Certification' },
    ],
    validators: {
      purity: { in: ['24K','22K','18K','14K','950','925','other'] },
      gross_weight: { min: 0.001 },
      gemstone_carat: { min: 0 },
    },
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    description: 'Sizes (S/M/L/XL or numeric), color variants with swatches, fabric type, fit, care instructions, season/collection tagging.',
    icon: 'Shirt',
    color: 'pink',
    version: '1.0.0',
    category: 'industry',
    author: 'KenTech Global',
    is_premium: false,
    config_schema: {
      size_system: { type: 'select', options: ['letter','numeric','both'], default: 'letter' },
      enable_color_swatches: { type: 'boolean', default: true },
      enable_care_labels: { type: 'boolean', default: true },
    },
    product_fields: [
      { key: 'sizes',         label: 'Available sizes',  type: 'multiselect', options: ['XS','S','M','L','XL','XXL','2XL','3XL'], group: 'Sizing' },
      { key: 'size_chart_url', label: 'Size chart image', type: 'image', group: 'Sizing' },
      { key: 'colors',        label: 'Color variants',   type: 'color_array', group: 'Colors' },
      { key: 'fabric',        label: 'Fabric / material', type: 'text', group: 'Material' },
      { key: 'fabric_blend',  label: 'Blend (%)',        type: 'text', placeholder: '60% Cotton, 40% Polyester', group: 'Material' },
      { key: 'fit_type',      label: 'Fit',              type: 'select', options: ['Regular','Slim','Relaxed','Oversized','Tailored'], group: 'Fit' },
      { key: 'length',        label: 'Length',            type: 'select', options: ['Cropped','Regular','Long','Maxi'], group: 'Fit' },
      { key: 'gender',        label: 'Gender',            type: 'select', options: ['Men','Women','Unisex','Kids','Boys','Girls'], group: 'Classification' },
      { key: 'season',        label: 'Season',            type: 'multiselect', options: ['Spring','Summer','Autumn','Winter','All Season'], group: 'Classification' },
      { key: 'care_instructions', label: 'Care instructions', type: 'textarea', group: 'Care' },
      { key: 'wash_type',     label: 'Wash type',         type: 'select', options: ['Machine wash','Hand wash','Dry clean only','Do not wash'], group: 'Care' },
    ],
    validators: {
      sizes: { minItems: 1, message: 'At least one size required' },
    },
  },
  {
    id: 'realestate',
    name: 'Real Estate & Property',
    description: 'Bedrooms, bathrooms, area (sqft/sqm), property type, location/map coordinates, amenities, agent details, floor plans.',
    icon: 'Building2',
    color: 'teal',
    version: '1.0.0',
    category: 'industry',
    author: 'KenTech Global',
    is_premium: false,
    config_schema: {
      area_unit: { type: 'select', options: ['sqft','sqm','both'], default: 'sqft' },
      enable_map: { type: 'boolean', default: true },
      listing_type: { type: 'select', options: ['sale','rent','both'], default: 'both' },
    },
    product_fields: [
      { key: 'property_type',  label: 'Property type',   type: 'select', options: ['Apartment','Villa','Townhouse','Penthouse','Studio','Office','Plot','Warehouse','Shop'], required: true, group: 'Property' },
      { key: 'listing_type',   label: 'Listing type',    type: 'select', options: ['For Sale','For Rent','Off-plan'], required: true, group: 'Property' },
      { key: 'bedrooms',       label: 'Bedrooms',        type: 'number', step: 1, min: 0, group: 'Specifications' },
      { key: 'bathrooms',      label: 'Bathrooms',       type: 'number', step: 1, min: 0, group: 'Specifications' },
      { key: 'area_sqft',      label: 'Area (sqft)',      type: 'number', step: 1, group: 'Specifications' },
      { key: 'area_sqm',       label: 'Area (sqm)',       type: 'number', step: 0.01, group: 'Specifications' },
      { key: 'floors',         label: 'Floor / Level',    type: 'number', step: 1, group: 'Specifications' },
      { key: 'parking',        label: 'Parking spaces',   type: 'number', step: 1, group: 'Specifications' },
      { key: 'furnished',      label: 'Furnished',        type: 'select', options: ['Furnished','Semi-furnished','Unfurnished'], group: 'Specifications' },
      { key: 'location',       label: 'Location / area',  type: 'text', group: 'Location' },
      { key: 'city',           label: 'City',             type: 'text', group: 'Location' },
      { key: 'latitude',       label: 'Latitude',         type: 'number', step: 0.000001, group: 'Location' },
      { key: 'longitude',      label: 'Longitude',        type: 'number', step: 0.000001, group: 'Location' },
      { key: 'amenities',      label: 'Amenities',        type: 'multiselect', options: ['Pool','Gym','Parking','Security','Balcony','Garden','Central AC','Elevator','Maid Room','Storage','Beach Access','Concierge'], group: 'Amenities' },
      { key: 'developer',      label: 'Developer',        type: 'text', group: 'Agent' },
      { key: 'agent_name',     label: 'Agent name',       type: 'text', group: 'Agent' },
      { key: 'agent_phone',    label: 'Agent phone',      type: 'text', group: 'Agent' },
      { key: 'handover_date',  label: 'Handover date',    type: 'date', group: 'Agent' },
    ],
    validators: {
      bedrooms: { min: 0 },
      bathrooms: { min: 0 },
      area_sqft: { min: 1 },
    },
  },
];

(async () => {
  await sequelize.authenticate();
  for (const p of PLUGINS) {
    await Plugin.upsert(p);
    console.log(`  ✅ Plugin registered: ${p.name}`);
  }
  console.log('\n✅ All plugins seeded');
  await sequelize.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
