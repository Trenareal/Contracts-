import React from 'react';
import { ContractMaterialItem } from '../types';
import { formatCurrency, CURRENCY_LIST } from '../utils/formatters';
import { Trash2, Plus, Package, Calculator, Copy, Sparkles, Check, Layers } from 'lucide-react';

interface MaterialsTableProps {
  materials: ContractMaterialItem[];
  currency?: string;
  onChange: (materials: ContractMaterialItem[]) => void;
  onDeleteTable?: () => void;
  readOnly?: boolean;
  i18nLabels?: Record<string, string>;
  onSyncTotalCost?: (total: number) => void;
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials = [],
  currency = 'NGN',
  onChange,
  onDeleteTable,
  readOnly = false,
  i18nLabels = {},
  onSyncTotalCost,
}) => {
  const currencySymbol = CURRENCY_LIST.find(
    (c) => c.code.toLowerCase() === currency.toLowerCase() || c.symbol === currency
  )?.symbol || currency;

  const calculateTotal = (items: ContractMaterialItem[]) => {
    return items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  };

  const handleItemChange = (
    id: string,
    field: keyof ContractMaterialItem,
    value: string | number
  ) => {
    const updated = materials.map((mat) => {
      if (mat.id !== id) return mat;

      const newMat = { ...mat, [field]: value };

      // Auto recalculate totalPrice if quantity or unitPrice changes
      if (field === 'quantity' || field === 'unitPrice') {
        const qtyVal = field === 'quantity' ? value : newMat.quantity;
        const priceVal = field === 'unitPrice' ? value : newMat.unitPrice;

        const qty = Number(qtyVal) || 0;
        const price = Number(priceVal) || 0;
        newMat.totalPrice = Math.round(qty * price * 100) / 100;
      }

      return newMat;
    });

    onChange(updated);
  };

  const handleAddRow = (presetItem?: { item: string; quality: string; quantity: number; unitPrice: number }) => {
    const newRow: ContractMaterialItem = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      item: presetItem?.item || '',
      quantity: presetItem?.quantity ?? 1,
      quality: presetItem?.quality || 'High Quality / Standard Specification',
      unitPrice: presetItem?.unitPrice ?? 0,
      totalPrice: presetItem ? presetItem.quantity * presetItem.unitPrice : 0,
    };
    onChange([...materials, newRow]);
  };

  const handleDuplicateRow = (id: string) => {
    const itemToDup = materials.find((m) => m.id === id);
    if (!itemToDup) return;
    const duplicated: ContractMaterialItem = {
      ...itemToDup,
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      item: `${itemToDup.item} (Copy)`,
    };
    const index = materials.findIndex((m) => m.id === id);
    const updated = [...materials];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
  };

  const handleRemoveRow = (id: string) => {
    onChange(materials.filter((mat) => mat.id !== id));
  };

  const grandTotal = calculateTotal(materials);

  return (
    <div className="space-y-4 bg-white border-2 border-slate-200 p-3.5 sm:p-5 shadow-xs rounded-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>{i18nLabels['materialsTableTitle'] || 'Itemized Work, Quality & Cost Breakdown Table'}</span>
              {!readOnly && (
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                  Editable Table
                </span>
              )}
            </h4>
            <p className="text-[11px] font-sans text-slate-500 mt-0.5">
              Specify item names, quantities, quality grades/specs, and unit amounts. Amounts calculate automatically.
            </p>
          </div>
        </div>

        {!readOnly && onDeleteTable && (
          <button
            type="button"
            onClick={onDeleteTable}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-sans font-bold transition-all cursor-pointer rounded-xl active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{i18nLabels['deleteTable'] || 'Remove Table'}</span>
          </button>
        )}
      </div>

      {/* Quick Add Presets Strip (When in Edit Mode) */}
      {!readOnly && (
        <div className="bg-slate-50 p-3 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Quick Add Common Work / Material Items:
            </span>
            <span className="text-slate-400 font-normal">Click to insert a row</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleAddRow({ item: 'Primary Raw Materials & Supplies', quality: 'Grade A / Manufacturer Certified', quantity: 1, unitPrice: 0 })}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              + Raw Materials
            </button>
            <button
              type="button"
              onClick={() => handleAddRow({ item: 'Skilled Labor & Craftsmanship', quality: 'Master Artisan / Expert Execution', quantity: 1, unitPrice: 0 })}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              + Labor & Craft
            </button>
            <button
              type="button"
              onClick={() => handleAddRow({ item: 'Custom Fabrication & Assembly', quality: 'Precision Tolerance & Bespoke Specs', quantity: 1, unitPrice: 0 })}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              + Custom Fabrication
            </button>
            <button
              type="button"
              onClick={() => handleAddRow({ item: 'Surface Finishing, Treatment & Polish', quality: 'Protective Sealed & High Lustre', quantity: 1, unitPrice: 0 })}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              + Finishing & Polish
            </button>
            <button
              type="button"
              onClick={() => handleAddRow({ item: 'Delivery, Logistics & On-site Handover', quality: 'Insured Transit & Safe Unloading', quantity: 1, unitPrice: 0 })}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
            >
              + Logistics & Delivery
            </button>
          </div>
        </div>
      )}

      {/* MOBILE VIEW (md:hidden): Touch-friendly card items */}
      <div className="md:hidden space-y-3">
        {materials.length === 0 ? (
          <div className="py-6 text-center text-slate-400 italic text-xs bg-slate-50 border border-slate-200 rounded-xl">
            No items in table. {!readOnly && 'Tap "+ Add New Item" below.'}
          </div>
        ) : (
          materials.map((row, idx) => (
            <div 
              key={row.id} 
              className="bg-slate-50 border-2 border-slate-200 p-3.5 space-y-3 rounded-xl relative shadow-2xs"
            >
              {/* Card Title & Actions */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Item #{idx + 1}
                </span>
                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateRow(row.id)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 rounded-lg cursor-pointer"
                      title="Duplicate item"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 bg-white border border-slate-200 rounded-lg cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Item Description */}
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Item / Work Deliverable Description <span className="text-red-500">*</span>
                </label>
                {readOnly ? (
                  <p className="text-xs font-bold text-slate-900 bg-white p-2.5 border border-slate-200 rounded-xl">{row.item || '—'}</p>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Italian Cashmere Fabric / Hollow Steel Pipes"
                    value={row.item}
                    onChange={(e) => handleItemChange(row.id, 'item', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600 rounded-xl"
                  />
                )}
              </div>

              {/* Quality Specification */}
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Quality Grade / Specification <span className="text-blue-600 font-normal">(e.g. Grade A, 100% Pure, Kiln-Dried)</span>
                </label>
                {readOnly ? (
                  <p className="text-xs font-sans text-slate-800 italic bg-white p-2.5 border border-slate-200 rounded-xl">{row.quality || 'Standard Specification'}</p>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Grade A / 100% Pure Cashmere / Rust-Resistant"
                    value={row.quality}
                    onChange={(e) => handleItemChange(row.id, 'quality', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600 rounded-xl"
                  />
                )}
              </div>

              {/* Quantity, Unit Price & Total Amount */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 items-end">
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase text-slate-700 mb-1">
                    Quantity (Qty)
                  </label>
                  {readOnly ? (
                    <span className="text-xs font-mono font-bold text-slate-900 block bg-white p-2 border border-slate-200 rounded-xl text-center">{row.quantity}</span>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      required
                      value={row.quantity || ''}
                      onChange={(e) => handleItemChange(row.id, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full text-center py-2 bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase text-slate-700 mb-1">
                    Unit Price ({currencySymbol})
                  </label>
                  {readOnly ? (
                    <span className="text-xs font-mono font-bold block bg-white p-2 border border-slate-200 rounded-xl text-right">{formatCurrency(row.unitPrice, currency)}</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={row.unitPrice === 0 ? '' : row.unitPrice}
                      onChange={(e) => handleItemChange(row.id, 'unitPrice', e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full text-right px-2 py-2 bg-white border border-blue-300 focus:border-blue-600 text-xs font-mono font-bold text-slate-900 focus:outline-none rounded-xl"
                    />
                  )}
                </div>

                <div className="text-right">
                  <label className="block text-[10px] font-sans font-bold uppercase text-slate-700 mb-1">
                    Total Amount
                  </label>
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-right">
                    <span className="text-xs font-mono font-extrabold text-emerald-900 block truncate">
                      {formatCurrency(row.totalPrice || (row.quantity * row.unitPrice), currency)}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ))
        )}

        {/* Mobile Grand Total Strip */}
        {materials.length > 0 && (
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between font-bold rounded-2xl shadow-md">
            <span className="text-xs font-sans uppercase tracking-wider text-slate-300">Total Table Cost:</span>
            <span className="font-mono text-base sm:text-lg text-emerald-400 font-black">{formatCurrency(grandTotal, currency)}</span>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW (hidden md:block): Spreadsheet-style table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border-2 border-slate-200">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200 text-[11px] font-sans uppercase font-bold tracking-wider text-slate-700">
              <th className="py-3 px-3 w-[5%] text-center">#</th>
              <th className="py-3 px-3.5 w-[32%]">{i18nLabels['itemName'] || 'Item / Work Deliverable'}</th>
              <th className="py-3 px-3 w-[10%] text-center">{i18nLabels['quantity'] || 'Quantity (Qty)'}</th>
              <th className="py-3 px-3 w-[25%]">{i18nLabels['qualitySpec'] || 'Quality & Specifications'}</th>
              <th className="py-3 px-3 w-[15%] text-right">
                <span className="inline-flex items-center gap-1">
                  <span>{i18nLabels['unitPrice'] || 'Unit Price'}</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono">
                    {currencySymbol}
                  </span>
                </span>
              </th>
              <th className="py-3 px-3.5 w-[13%] text-right">{i18nLabels['subtotal'] || 'Total Amount'}</th>
              {!readOnly && <th className="py-3 px-2 w-[8%] text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs font-sans bg-white">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 6 : 7} className="py-8 text-center text-slate-400 italic">
                  No items added yet. {!readOnly && 'Click "+ Add Item" below to start itemizing work.'}
                </td>
              </tr>
            ) : (
              materials.map((row, idx) => (
                <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400 text-xs">
                    {idx + 1}
                  </td>

                  <td className="py-2.5 px-3">
                    {readOnly ? (
                      <span className="font-semibold text-slate-900">{row.item || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="e.g. 100% Cashmere Wool Fabric / 3-inch Steel Pipes"
                        value={row.item}
                        onChange={(e) => handleItemChange(row.id, 'item', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
                      />
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    {readOnly ? (
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{row.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        required
                        value={row.quantity || ''}
                        onChange={(e) => handleItemChange(row.id, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full text-center py-2 bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
                      />
                    )}
                  </td>

                  <td className="py-2.5 px-2">
                    {readOnly ? (
                      <span className="text-slate-700 italic text-[11px]">{row.quality || 'Standard Specification'}</span>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Grade A / 100% Pure / Kiln-Dried Hardwood"
                        value={row.quality}
                        onChange={(e) => handleItemChange(row.id, 'quality', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 rounded-xl"
                      />
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-right">
                    {readOnly ? (
                      <span className="font-mono font-semibold">{formatCurrency(row.unitPrice, currency)}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={row.unitPrice === 0 ? '' : row.unitPrice}
                        onChange={(e) => handleItemChange(row.id, 'unitPrice', e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full text-right px-3 py-2 bg-slate-50 border border-blue-300 focus:border-blue-600 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none rounded-xl"
                      />
                    )}
                  </td>

                  <td className="py-2.5 px-3.5 text-right font-mono font-extrabold text-slate-900">
                    {formatCurrency(row.totalPrice || (row.quantity * row.unitPrice), currency)}
                  </td>

                  {!readOnly && (
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(row.id)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate row"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {materials.length > 0 && (
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-800">
                <td colSpan={4} className="py-3.5 px-4 uppercase tracking-wider text-slate-300 font-sans">
                  Total Itemized Value:
                </td>
                <td colSpan={2} className="py-3.5 px-4 text-right font-mono text-sm sm:text-base text-emerald-400 font-black">
                  {formatCurrency(grandTotal, currency)}
                </td>
                {!readOnly && <td></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Action Buttons & Sync */}
      {!readOnly && (
        <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddRow()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-sans font-bold uppercase tracking-wider text-white transition-all cursor-pointer rounded-xl shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item Row</span>
            </button>
          </div>

          {grandTotal > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-300 px-3 py-2 rounded-xl">
                Sum: <strong className="text-emerald-800">{formatCurrency(grandTotal, currency)}</strong>
              </span>
              {onSyncTotalCost && (
                <button
                  type="button"
                  onClick={() => onSyncTotalCost(grandTotal)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                  title="Copy table total to contract fee"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Set as Contract Total Fee</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

