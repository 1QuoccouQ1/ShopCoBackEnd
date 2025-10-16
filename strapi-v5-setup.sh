#!/usr/bin/env bash
set -e

ROOT="./src"

# Create component folders
mkdir -p "$ROOT/components/seo"
mkdir -p "$ROOT/components/gallery"
mkdir -p "$ROOT/components/testimonial"
mkdir -p "$ROOT/components/pricing"

# Create API folders
mkdir -p "$ROOT/api/product/content-types/product"
mkdir -p "$ROOT/api/category/content-types/category"
mkdir -p "$ROOT/api/blog-post/content-types/blog-post"
mkdir -p "$ROOT/api/tag/content-types/tag"

# Components

cat > "$ROOT/components/seo/meta.json" <<'JSON'
{
  "collectionName": "components_seo_meta",
  "info": { "displayName": "SEO" },
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
  "attributes": {
    "name": { "type": "string" },
    "avatar": { "type": "media", "allowedTypes": ["images"] },
    "comment": { "type": "richtext" }
  }
}
JSON

cat > "$ROOT/components/pricing/pricing-option.json" <<'JSON'
{
  "collectionName": "components_pricing_pricing_option",
  "info": { "displayName": "PricingOption" },
  "attributes": {
    "label": { "type": "string" },
    "price": { "type": "decimal" },
    "features": { "type": "json" }
  }
}
JSON

# Content-types

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
    "slug": { "type": "uid", "targetField": "name" },
    "price": { "type": "decimal", "required": true },
    "short_description": { "type": "text" },
    "description": { "type": "richtext" },
    "image": { "type": "media", "allowedTypes": ["images"] },
    "gallery": { "type": "component", "component": "gallery.gallery" },
    "category": { "type": "relation", "relation": "manyToOne", "target": "api::category.category" },
    "pricing_options": { "type": "component", "repeatable": true, "component": "pricing.pricing-option" },
    "seo": { "type": "component", "component": "seo.meta" }
  }
}
JSON

cat > "$ROOT/api/category/content-types/category/schema.json" <<'JSON'
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Category"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title" },
    "description": { "type": "text" },
    "products": { "type": "relation", "relation": "oneToMany", "target": "api::product.product" }
  }
}
JSON

cat > "$ROOT/api/blog-post/content-types/blog-post/schema.json" <<'JSON'
{
  "kind": "collectionType",
  "collectionName": "blog_posts",
  "info": {
    "singularName": "blog-post",
    "pluralName": "blog-posts",
    "displayName": "BlogPost"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "title" },
    "content": { "type": "richtext" },
    "coverImage": { "type": "media", "allowedTypes": ["images"] },
    "tags": { "type": "relation", "relation": "manyToMany", "target": "api::tag.tag" },
    "seo": { "type": "component", "component": "seo.meta" }
  }
}
JSON

cat > "$ROOT/api/tag/content-types/tag/schema.json" <<'JSON'
{
  "kind": "collectionType",
  "collectionName": "tags",
  "info": {
    "singularName": "tag",
    "pluralName": "tags",
    "displayName": "Tag"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "name" },
    "blog_posts": { "type": "relation", "relation": "manyToMany", "target": "api::blog-post.blog-post" }
  }
}
JSON

echo "✅ Strapi v5 schemas + components created!"
echo "👉 Next steps:"
echo "   1) rm -rf .cache build .tmp"
echo "   2) npm run develop"
echo "   3) Open http://localhost:1337/admin and login"
echo "   4) You'll see Product, Category, BlogPost, Tag"


