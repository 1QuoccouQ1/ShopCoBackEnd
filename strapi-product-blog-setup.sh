#!/usr/bin/env bash
set -e

# Script to create Strapi v4 content-type and component schemas for a Product + Blog project.
# This version creates controllers, routes, and services as well.
# Place this script at the root of your Strapi project (where package.json is), then run:
#   chmod +x strapi-product-blog-setup.sh
#   ./strapi-product-blog-setup.sh

ROOT="./src"

mkdir -p "$ROOT/components/seo"
mkdir -p "$ROOT/components/gallery"
mkdir -p "$ROOT/components/testimonial"
mkdir -p "$ROOT/components/pricing"

# Helper to create API folders with boilerplate
create_api() {
  NAME=$1
  mkdir -p "$ROOT/api/$NAME/content-types/$NAME"
  mkdir -p "$ROOT/api/$NAME/controllers"
  mkdir -p "$ROOT/api/$NAME/routes"
  mkdir -p "$ROOT/api/$NAME/services"

  # controller
  cat > "$ROOT/api/$NAME/controllers/$NAME.js" <<EOF
'use strict';
const { createCoreController } = require('@strapi/strapi').factories;
module.exports = createCoreController('api::$NAME.$NAME');
EOF

  # service
  cat > "$ROOT/api/$NAME/services/$NAME.js" <<EOF
'use strict';
const { createCoreService } = require('@strapi/strapi').factories;
module.exports = createCoreService('api::$NAME.$NAME');
EOF

  # route
  cat > "$ROOT/api/$NAME/routes/$NAME.js" <<EOF
'use strict';
const { createCoreRouter } = require('@strapi/strapi').factories;
module.exports = createCoreRouter('api::$NAME.$NAME');
EOF
}

# Create API folders
create_api "product"
create_api "category"
create_api "blog-post"
create_api "tag"

# --- Components ---
cat > "$ROOT/components/seo/meta.json" <<'JSON'
{
  "collectionName": "components_seo_meta",
  "info": { "displayName": "SEO", "description": "SEO meta fields" },
  "options": {},
  "attributes": {
    "metaTitle": { "type": "string" },
    "metaDescription": { "type": "text" },
    "keywords": { "type": "string" }
  }
}
JSON

cat > "$ROOT/components/gallery/gallery.json" <<'JSON'
{
  "collectionName": "components_gallery_gallery",
  "info": { "displayName": "Gallery" },
  "options": {},
  "attributes": {
    "images": { "type": "media", "multiple": true, "allowedTypes": ["images"] },
    "caption": { "type": "string" }
  }
}
JSON

cat > "$ROOT/components/testimonial/testimonial.json" <<'JSON'
{
  "collectionName": "components_testimonial_testimonial",
  "info": { "displayName": "Testimonial" },
  "options": {},
  "attributes": {
    "name": { "type": "string" },
    "avatar": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "comment": { "type": "richtext" }
  }
}
JSON

cat > "$ROOT/components/pricing/pricing-option.json" <<'JSON'
{
  "collectionName": "components_pricing_pricing_option",
  "info": { "displayName": "PricingOption" },
  "options": {},
  "attributes": {
    "label": { "type": "string" },
    "price": { "type": "decimal" },
    "features": { "type": "json" }
  }
}
JSON

# --- Category content-type ---
cat > "$ROOT/api/category/content-types/category/schema.json" <<'JSON'
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Category",
    "description": "Product categories"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "description": { "type": "text" },
    "products": { "type": "relation", "relation": "oneToMany", "target": "api::product.product" }
  }
}
JSON

# --- Tag content-type ---
cat > "$ROOT/api/tag/content-types/tag/schema.json" <<'JSON'
{
  "kind": "collectionType",
  "collectionName": "tags",
  "info": { "singularName": "tag", "pluralName": "tags", "displayName": "Tag" },
  "options": { "draftAndPublish": false },
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name", "required": true },
    "blog_posts": { "type": "relation", "relation": "manyToMany", "target": "api::blog-post.blog-post" }
  }
}
JSON

# --- Product content-type ---
cat > "$ROOT/api/product/content-types/product/schema.json" <<'JSON'
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": {
    "singularName": "product",
    "pluralName": "products",
    "displayName": "Product",
    "description": "Store products"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name", "required": true },
    "price": { "type": "decimal", "required": true },
    "short_description": { "type": "text" },
    "description": { "type": "richtext" },
    "image": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "gallery": { "type": "component", "repeatable": false, "component": "gallery.gallery" },
    "category": { "type": "relation", "relation": "manyToOne", "target": "api::category.category" },
    "pricing_options": { "type": "component", "repeatable": true, "component": "pricing.pricing-option" },
    "seo": { "type": "component", "repeatable": false, "component": "seo.meta" }
  }
}
JSON

# --- BlogPost content-type ---
cat > "$ROOT/api/blog-post/content-types/blog-post/schema.json" <<'JSON'
{
  "kind": "collectionType",
  "collectionName": "blog_posts",
  "info": {
    "singularName": "blog-post",
    "pluralName": "blog-posts",
    "displayName": "BlogPost",
    "description": "Blog posts for content marketing"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title", "required": true },
    "content": { "type": "richtext" },
    "coverImage": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "tags": { "type": "relation", "relation": "manyToMany", "target": "api::tag.tag" },
    "seo": { "type": "component", "repeatable": false, "component": "seo.meta" }
  }
}
JSON


echo "Schemas, controllers, routes, and services created under $ROOT."
echo "Next steps:"
echo "  1) Restart Strapi: npm run develop"
echo "  2) Open Admin at http://localhost:1337/admin and check Content-Types Builder"
echo "  3) If you want public API access, go to Settings -> Roles -> Public and enable find/findOne for Products and BlogPosts"

echo "Done."
