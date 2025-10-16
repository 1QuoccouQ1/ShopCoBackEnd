import type { Schema, Struct } from '@strapi/strapi';

export interface ProductColorOption extends Struct.ComponentSchema {
  collectionName: 'components_product_color_options';
  info: {
    displayName: 'color-option';
  };
  attributes: {
    Name: Schema.Attribute.String;
  };
}

export interface ProductSize extends Struct.ComponentSchema {
  collectionName: 'components_product_sizes';
  info: {
    displayName: 'size';
  };
  attributes: {
    Name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.color-option': ProductColorOption;
      'product.size': ProductSize;
    }
  }
}
