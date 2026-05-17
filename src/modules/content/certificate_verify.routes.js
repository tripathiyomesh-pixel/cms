const express = require('express');
const router  = express.Router();
const db = require('../../config/db.pool');

// Public — no auth required
router.get('/:cert_number', async (req,res)=>{
  try {
    const certNo = req.params.cert_number.replace(/[^A-Za-z0-9\-]/g,'');
    const [certs]=await db.query(`
      SELECT pc.*,p.name as product_name,p.sku,p.inventory_type,
             dd.shape,dd.carat,dd.color,dd.clarity,dd.cut,dd.polish,dd.symmetry,dd.fluorescence,dd.diamond_type,
             gd.gemstone_type,gd.carat as gem_carat,gd.country_of_origin as gem_origin
      FROM product_certifications pc
      JOIN products p ON p.id=pc.product_id
      LEFT JOIN diamond_details dd ON dd.product_id=p.id
      LEFT JOIN gemstone_details gd ON gd.product_id=p.id
      WHERE pc.cert_number ILIKE $1 LIMIT 1
    `,[`%${certNo}%`]);
    if(certs.length) return res.json({ success:true, data:{ ...certs[0], source:'product_certifications' } });
    // Also check diamond_details.primary_cert_no
    const [dd]=await db.query(`SELECT d.*,p.name as product_name,p.sku FROM diamond_details d JOIN products p ON p.id=d.product_id WHERE d.primary_cert_no ILIKE $1 LIMIT 1`,[`%${certNo}%`]);
    if(dd.length) return res.json({ success:true, data:{ ...dd[0], source:'diamond_details' } });
    res.status(404).json({ success:false, message:'Certificate not found. Please check the number and try again.' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
