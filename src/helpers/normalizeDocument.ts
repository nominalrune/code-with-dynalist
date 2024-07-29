
export function normalizeToDocumentQuickPick(apiDocument: Document): DocumentQuickPick {
    const label = apiDocument.isFavorite ? `⭐ ${apiDocument.name}` : apiDocument.name;

    return { ...apiDocument, label, alwaysShow: true };
}
