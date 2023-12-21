export function getVendors(data) {
  // Filtrer les vendors uniques
  const vendorsSet = new Set(
    data.data.products.edges
      .map(edge => edge.node.vendor)
      .filter(vendor => vendor !== "")
  );
  
  // Convertir le Set en tableau
  const vendors = Array.from(vendorsSet);
  return vendors
}

export function getproductTypes(data) {
    // Filtrer les productTypes uniques
  const productTypesSet = new Set(
    data.data.products.edges
      .map(edge => edge.node.productType)
      .filter(productType => productType !== "")
  );

  // Convertir le Set en tableau
  const productTypes = Array.from(productTypesSet);
  return productTypes
}
