import React from 'react';
import { ContractMaterialItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Trash2, Plus, AlertCircle, RefreshCw, Package } from 'lucide-react';

interface MaterialsTableProps {
  materials: ContractMaterialItem[];
  currency?: string;
  onChange: (materials: ContractMaterialItem[]) => void;
  onDeleteTable?: () => void;
  readOnly?: boolean;
  i18nLabels?: Record<string, string>;
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials = [],
  currency = 'NGN',
  onChange,
  onDeleteTable,
  readOnly = false,
  i18nLabels = {},
}) => {
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
        const qty = Number(field === 'quantity' ? value : newMat.quantity) || 0;
        const price = Number(field === 'unitPrice' ? value : newMat.unitPrice) || 0;
        newMat.totalPrice = qty * price;
      }

      return newMat;
    });

    onChange(updated);
  };

  const handleAddRow = () => {
    const newRow: ContractMaterialItem = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      item: '',
      quantity: 1,
      quality: 'Standard Grade / Specification',
      unitPrice: 0,
      totalPrice: 0,
    };
    onChange([...materials, newRow]);
  };

  const handleRemoveRow = (id: string) => {
    onChange(materials.filter((mat) => mat.id !== id));
  };

  const grandTotal = calculateTotal(materials);

  return (
    <div className="space-y-3 bg-white border border-slate-200 p-4 sm:p-5 shadow-xs rounded-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            {i18nLabels['materialsTableTitle'] || 'Materials & Specifications Breakdown'}
          </h4>
          <p className="text-[11px] font-sans text-slate-400 mt-0.5">
            Itemized specifications, quality grades, quantities, and pricing.
          </p>
        </div>

        {!readOnly && onDeleteTable && (
          <button
            type="button"
            onClick={onDeleteTable}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-sans font-bold transition-all cursor-pointer rounded-xl"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{i18nLabels['deleteTable'] || 'Remove Table'}</span>
          </button>
        )}
      </div>

      {/* MOBILE VIEW (md:hidden): Touch-friendly card items */}
      <div className="md:hidden space-y-2.5">
        {materials.length === 0 ? (
          <div className="py-6 text-center text-slate-400 italic text-xs bg-slate-50 border border-slate-200 rounded-xl">
            No material items added yet. {!readOnly && 'Tap "Add Material Item" below.'}
          </div>
        ) : (
          materials.map((row, idx) => (
            <div 
              key={row.id} 
              className="bg-slate-50 border border-slate-200 p-3.5 space-y-2.5 rounded-xl relative"
            >
              {/* Card Title & Delete */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  Item #{idx + 1}
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Item Description */}
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Item / Material Description
                </label>
                {readOnly ? (
                  <p className="text-xs font-bold text-slate-900">{row.item}</p>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Italian Cashmere Wool / 304 Stainless Pipe"
                    value={row.item}
                    onChange={(e) => handleItemChange(row.id, 'item', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                  />
                )}
              </div>

              {/* Quality Specification */}
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Grade / Specs
                </label>
                {readOnly ? (
                  <p className="text-xs font-sans text-slate-600 italic">{row.quality}</p>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Grade A / 100% Cotton / Kiln-Dried"
                    value={row.quality}
                    onChange={(e) => handleItemChange(row.id, 'quality', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 rounded-xl"
                  />
                )}
              </div>

              {/* Qty, Unit Price & Subtotal */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 items-end">
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase text-slate-600 mb-1">
                    Qty
                  </label>
                  {readOnly ? (
                    <span className="text-xs font-mono font-bold">{row.quantity}</span>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      required
                      value={row.quantity}
                      onChange={(e) => handleItemChange(row.id, 'quantity', Number(e.target.value))}
                      className="w-full text-center py-1.5 bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase text-slate-600 mb-1">
                    Unit Price
                  </label>
                  {readOnly ? (
                    <span className="text-xs font-mono">{formatCurrency(row.unitPrice, currency)}</span>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      value={row.unitPrice}
                      onChange={(e) => handleItemChange(row.id, 'unitPrice', Number(e.target.value))}
                      className="w-full text-right px-2 py-1.5 bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl"
                    />
                  )}
                </div>

                <div className="text-right">
                  <label className="block text-[10px] font-sans font-bold uppercase text-slate-600 mb-1">
                    Subtotal
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-800 block truncate">
                    {formatCurrency(row.totalPrice || (row.quantity * row.unitPrice), currency)}
                  </span>
                </div>
              </div>

            </div>
          ))
        )}

        {/* Mobile Grand Total Strip */}
        {materials.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between font-bold rounded-xl">
            <span className="text-xs font-sans uppercase tracking-wider text-slate-600">Materials Total:</span>
            <span className="font-mono text-sm text-emerald-800">{formatCurrency(grandTotal, currency)}</span>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW (hidden md:block): Full Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-sans uppercase font-bold tracking-wider text-slate-500">
              <th className="py-3 px-3 w-[30%]">{i18nLabels['itemName'] || 'Item / Material Description'}</th>
              <th className="py-3 px-3 w-[12%] text-center">{i18nLabels['quantity'] || 'Qty'}</th>
              <th className="py-3 px-3 w-[28%]">{i18nLabels['qualitySpec'] || 'Quality Grade / Specs'}</th>
              <th className="py-3 px-3 w-[15%] text-right">{i18nLabels['unitPrice'] || 'Unit Price'}</th>
              <th className="py-3 px-3 w-[15%] text-right">{i18nLabels['subtotal'] || 'Subtotal'}</th>
              {!readOnly && <th className="py-3 px-2 w-[5%] text-center"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-sans">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 5 : 6} className="py-6 text-center text-slate-400 italic">
                  No material items added yet. {!readOnly && 'Click "Add Material Row" below.'}
                </td>
              </tr>
            ) : (
              materials.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    {readOnly ? (
                      <span className="font-medium text-slate-900">{row.item}</span>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="e.g. 100% Cashmere Wool / Grade 304 Steel Pipe"
                        value={row.item}
                        onChange={(e) => handleItemChange(row.id, 'item', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 rounded-lg"
                      />
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    {readOnly ? (
                      <span>{row.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        required
                        value={row.quantity}
                        onChange={(e) => handleItemChange(row.id, 'quantity', Number(e.target.value))}
                        className="w-full text-center py-1.5 bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 rounded-lg"
                      />
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    {readOnly ? (
                      <span className="text-slate-600 italic text-[11px]">{row.quality}</span>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Grade A / 100% Cotton / Kiln-Dried"
                        value={row.quality}
                        onChange={(e) => handleItemChange(row.id, 'quality', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-600 rounded-lg"
                      />
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    {readOnly ? (
                      <span className="font-mono">{formatCurrency(row.unitPrice, currency)}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={row.unitPrice}
                        onChange={(e) => handleItemChange(row.id, 'unitPrice', Number(e.target.value))}
                        className="w-full text-right px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 rounded-lg"
                      />
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(row.totalPrice || (row.quantity * row.unitPrice), currency)}
                  </td>

                  {!readOnly && (
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {materials.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
                <td colSpan={3} className="py-3 px-3 uppercase tracking-wider text-slate-600">
                  Materials Table Total Cost
                </td>
                <td colSpan={2} className="py-3 px-3 text-right font-mono text-sm text-emerald-800">
                  {formatCurrency(grandTotal, currency)}
                </td>
                {!readOnly && <td></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add Row Action Button */}
      {!readOnly && (
        <div className="pt-2 flex justify-start">
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-sans font-bold uppercase tracking-wider text-slate-800 transition-all cursor-pointer rounded-xl active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Add Material Item</span>
          </button>
        </div>
      )}
    </div>
  );
};
