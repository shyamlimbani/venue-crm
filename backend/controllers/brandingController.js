import Branding from '../models/Branding.js';

export const getBranding = async (req, res) => {
  try {
    let branding = await Branding.findOne({});
    if (!branding) {
      return res.json({
        success: true,
        data: {
          companyName: "Venue CRM",
          tagline: "Enterprise Edition",
          logo: "",
          favicon: ""
        }
      });
    }
    res.json({ success: true, data: branding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBranding = async (req, res) => {
  try {
    const { companyName, tagline } = req.body;

    let branding = await Branding.findOne({});
    if (!branding) {
      branding = new Branding({
        companyName: companyName !== undefined ? companyName : "Venue CRM",
        tagline: tagline !== undefined ? tagline : "Enterprise Edition",
        updatedBy: req.user._id
      });
    } else {
      if (companyName !== undefined) branding.companyName = companyName;
      if (tagline !== undefined) branding.tagline = tagline;
      branding.updatedBy = req.user._id;
    }

    await branding.save();
    res.json({ success: true, data: branding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    const { logo, favicon } = req.body;

    // Enforce 5MB limit (length * 3 / 4 calculates size in bytes for base64)
    if (logo && (logo.length * 3) / 4 > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Logo image size must be less than 5MB' });
    }
    if (favicon && (favicon.length * 3) / 4 > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Favicon image size must be less than 5MB' });
    }

    let branding = await Branding.findOne({});
    if (!branding) {
      branding = new Branding({
        companyName: "Venue CRM",
        tagline: "Enterprise Edition",
        logo: logo || "",
        favicon: favicon || "",
        updatedBy: req.user._id
      });
    } else {
      if (logo !== undefined) branding.logo = logo;
      if (favicon !== undefined) branding.favicon = favicon;
      branding.updatedBy = req.user._id;
    }

    await branding.save();
    res.json({ success: true, data: branding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLogo = async (req, res) => {
  try {
    const { type } = req.query; // 'logo' or 'favicon'

    let branding = await Branding.findOne({});
    if (branding) {
      if (type === 'favicon') {
        branding.favicon = "";
      } else {
        branding.logo = "";
      }
      branding.updatedBy = req.user._id;
      await branding.save();
    }

    res.json({ success: true, data: branding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
