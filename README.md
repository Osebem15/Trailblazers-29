# Department of Accounting Portal - UNILAG

A professional web portal for the Department of Accounting at the University of Lagos.

## Project Structure

```
department-portal/
├── index.html              # Main homepage
├── pages/
│   └── upload.html         # Resource upload page
├── css/
│   ├── style.css           # Main styles (homepage)
│   └── upload.css          # Upload page styles
├── js/
│   ├── main.js             # Common functionality
│   └── upload.js           # Upload handler (Supabase integration)
├── assets/
│   └── images/
│       ├── unilag-logo.jfif
│       └── front-gate.avif
└── README.md               # This file
```

## File Descriptions

### HTML Files
- **index.html** - Main landing page with hero section, info cards, and login sidebar
- **pages/upload.html** - Resource upload form for students and faculty

### Stylesheets
- **css/style.css** - Main stylesheet with:
  - Design system (color variables, typography)
  - Header and navigation
  - Hero section
  - Info grid components
  - Sidebar and login card
  - Footer
  - Responsive design

- **css/upload.css** - Upload page styles with:
  - Form styling
  - File input customization
  - Alert messages
  - Mobile responsiveness

### JavaScript Files
- **js/main.js** - Common scripts for:
  - Smooth page scrolling
  - Navigation handling

- **js/upload.js** - Upload functionality:
  - Supabase integration
  - File upload to storage
  - Metadata saving to database
  - Alert notifications
  - Error handling

### Assets
- **assets/images/** - Image files:
  - unilag-logo.jfif - University logo
  - front-gate.avif - Hero section background

## Features

- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Modern color scheme with gold accents
- ✅ Smooth navigation and scrolling
- ✅ Login portal widget
- ✅ Resource upload system
- ✅ Supabase backend integration
- ✅ Social media links
- ✅ Accessibility features (semantic HTML, ARIA labels)

## Color Scheme

- **Background**: `#000b18` (Dark Navy)
- **Cards**: `#021329` (Deep Blue)
- **Accent**: `#C5A059` (Gold)
- **Highlight**: `#D4AF37` (Bright Gold)
- **Text**: `#FFFFFF` (White)
- **Muted**: `#A0AEC0` (Light Gray)

## Getting Started

1. Open `index.html` in a web browser
2. Navigate using the menu or buttons
3. Access the upload page via the upload link

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Update Supabase credentials in `js/upload.js` as needed
- Images should be optimized for web (AVIF/WEBP format recommended)
- All external dependencies are loaded from CDNs

## Future Improvements

- [ ] Authentication system
- [ ] Database dashboard
- [ ] Admin panel
- [ ] Email notifications
- [ ] Advanced search
- [ ] Student profile pages
