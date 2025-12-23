
import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductVariation, ProductStock } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ImageIcon } from '../components/icons';

interface InventoryPageProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  logUserAction: (details: string) => void;
}

const SIZES: (keyof ProductStock)[] = ['M', 'L', 'XL', 'XXL'];

const emptyVariation: Omit<ProductVariation, 'id'> = {
    colorName: '',
    image: '',
    stock: { M: 0, L: 0, XL: 0, XXL: 0 },
};

const emptyProduct: Omit<Product, 'id' | 'lastModified'> = {
    code: '',
    name: '',
    price: 0,
    cost: 0,
    points: 0,
    alertLimit: 5,
    variations: [{ ...emptyVariation, id: `var-${Date.now()}` }],
};


// --- ProductModal Component ---
interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    productToEdit: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const [productData, setProductData] = useState<Omit<Product, 'id' | 'lastModified'>>({ ...emptyProduct });
    const [errors, setErrors] = useState<string[]>([]);
    
    useEffect(() => {
        if (productToEdit) {
            setProductData(productToEdit);
        } else {
            setProductData({ ...emptyProduct, variations: [{ ...emptyVariation, id: `var-${Date.now()}` }] });
        }
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setProductData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleVariationChange = (index: number, field: 'colorName', value: string) => {
        const newVariations = [...productData.variations];
        newVariations[index][field] = value;
        setProductData(prev => ({ ...prev, variations: newVariations }));
    };
    
    const handleStockChange = (varIndex: number, size: keyof ProductStock, value: number) => {
        const newVariations = [...productData.variations];
        newVariations[varIndex].stock[size] = value;
        setProductData(prev => ({ ...prev, variations: newVariations }));
    };

    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newVariations = [...productData.variations];
                newVariations[index].image = reader.result as string;
                setProductData(prev => ({ ...prev, variations: newVariations }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addVariation = () => {
        setProductData(prev => ({
            ...prev,
            variations: [...prev.variations, { ...emptyVariation, id: `var-${Date.now()}` }],
        }));
    };

    const removeVariation = (index: number) => {
        if (productData.variations.length > 1) {
            setProductData(prev => ({ ...prev, variations: prev.variations.filter((_, i) => i !== index) }));
        }
    };

    const validateAndSave = () => {
        const errs: string[] = [];
        if (!productData.name) errs.push('اسم المنتج مطلوب.');
        if (!productData.code) errs.push('كود المنتج مطلوب.');
        if (productData.price <= 0) errs.push('السعر يجب أن يكون أكبر من صفر.');
        productData.variations.forEach((v, i) => {
            if (!v.colorName) errs.push(`اسم اللون في التنوع رقم ${i + 1} مطلوب.`);
            if (!v.image) errs.push(`صورة اللون في التنوع رقم ${i + 1} مطلوبة.`);
        });

        if (errs.length > 0) {
            setErrors(errs);
            return;
        }
        
        const finalProduct: Product = {
            id: productToEdit?.id || `prod-${Date.now()}`,
            lastModified: new Date().toISOString(),
            ...productData,
        };
        onSave(finalProduct);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-text-primary flex-shrink-0">{productToEdit ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
                {errors.length > 0 && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                        {errors.map((e, i) => <p key={i}>- {e}</p>)}
                    </div>
                )}
                <div className="overflow-y-auto pr-2 flex-grow">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">البيانات الأساسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input name="name" value={productData.name} onChange={handleInputChange} placeholder="اسم المنتج" className="p-2 border rounded" />
                        <input name="code" value={productData.code} onChange={handleInputChange} placeholder="كود المنتج" className="p-2 border rounded" />
                        <input name="price" value={productData.price || ''} onChange={handleInputChange} type="number" placeholder="السعر" className="p-2 border rounded" />
                        <input name="cost" value={productData.cost || ''} onChange={handleInputChange} type="number" placeholder="التكلفة" className="p-2 border rounded" />
                        <input name="points" value={productData.points || ''} onChange={handleInputChange} type="number" placeholder="نقاط القطعة" className="p-2 border rounded" />
                        <input name="alertLimit" value={productData.alertLimit || ''} onChange={handleInputChange} type="number" placeholder="حد التنبيه" className="p-2 border rounded" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-text-primary mt-6 mb-2">تنوعات المنتج (الألوان والمقاسات)</h3>
                    <div className="space-y-4">
                    {productData.variations.map((variation, varIndex) => (
                        <div key={variation.id} className="bg-gray-50 p-4 rounded-lg border">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">صورة اللون</label>
                                    <label className="cursor-pointer flex items-center justify-center w-full h-24 bg-gray-200 rounded-md border-2 border-dashed hover:bg-gray-300">
                                        {variation.image ? <img src={variation.image} alt="preview" className="h-full w-full object-cover rounded-md" /> : <ImageIcon className="w-8 h-8 text-gray-500" />}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(varIndex, e)} />
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-text-secondary">تفاصيل اللون والمخزون</label>
                                        {productData.variations.length > 1 && <button onClick={() => removeVariation(varIndex)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>}
                                    </div>
                                    <input value={variation.colorName} onChange={e => handleVariationChange(varIndex, 'colorName', e.target.value)} placeholder="اسم اللون" className="w-full p-2 border rounded mb-2"/>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {SIZES.map(size => (
                                            <div key={size}>
                                                <label className="block text-xs font-medium text-text-secondary text-center">{size}</label>
                                                <input value={variation.stock[size] || ''} onChange={e => handleStockChange(varIndex, size, Number(e.target.value))} type="number" className="w-full p-2 border rounded text-center"/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </div>
                        </div>
                    ))}
                    </div>
                    <button onClick={addVariation} className="mt-4 text-sm text-primary font-semibold flex items-center gap-1"><PlusIcon className="w-4 h-4" /> إضافة لون آخر</button>
                </div>
                <div className="mt-6 flex justify-end space-x-2 space-x-reverse flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">إلغاء</button>
                    <button onClick={validateAndSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-800">{productToEdit ? 'حفظ التغييرات' : 'إضافة المنتج'}</button>
                </div>
            </div>
        </div>
    );
};

// --- ProductCard Component ---
const ProductCard: React.FC<{ product: Product; onEdit: () => void; onDelete: () => void }> = ({ product, onEdit, onDelete }) => {
    const [selectedVariation, setSelectedVariation] = useState(product.variations[0]);
    const [selectedSize, setSelectedSize] = useState<keyof ProductStock>('M');

    const totalStock = useMemo(() => 
        // FIX: Refactored to a simpler reduce to avoid potential type issues with Object.values.
        product.variations.reduce((total, v) => total + v.stock.M + v.stock.L + v.stock.XL + v.stock.XXL, 0)
    , [product.variations]);

    const isLowStock = totalStock <= product.alertLimit;

    return (
        <div className="bg-surface rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                {selectedVariation.image ? <img src={selectedVariation.image} alt={product.name} className="w-full h-full object-cover"/> : <ImageIcon className="w-12 h-12 text-gray-400"/>}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-text-primary">{product.name}</h3>
                    <div className="flex justify-between items-baseline">
                        <p className="text-sm text-text-secondary font-mono">{product.code}</p>
                        <p className="text-xl font-bold text-primary">{product.price.toLocaleString('ar-EG')} <span className="text-sm">جنيه</span></p>
                    </div>
                    <div className={`mt-2 p-2 rounded text-center font-semibold text-sm ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {isLowStock && <span className="font-bold">كمية منخفضة: </span>}
                        إجمالي المخزون: {totalStock}
                    </div>

                    <div className="mt-4">
                        <label className="text-xs font-medium text-text-secondary">اللون</label>
                        <div className="flex gap-2 mt-1">
                            {product.variations.map(v => (
                                <button key={v.id} onClick={() => setSelectedVariation(v)} className={`w-8 h-8 rounded-full border-2 ${selectedVariation.id === v.id ? 'border-primary' : 'border-transparent'}`}>
                                    <img src={v.image} alt={v.colorName} title={v.colorName} className="w-full h-full object-cover rounded-full" />
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="mt-2">
                        <label className="text-xs font-medium text-text-secondary">المقاس (المتوفر: {selectedVariation.stock[selectedSize]})</label>
                        <div className="flex gap-2 mt-1">
                            {SIZES.map(size => (
                                <button key={size} onClick={() => setSelectedSize(size)} 
                                className={`flex-1 p-1 text-xs rounded border ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-gray-100 hover:bg-gray-200'}`}
                                disabled={selectedVariation.stock[size] === 0}
                                >
                                {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                    <button onClick={onEdit} className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300 text-sm"><PencilIcon className="w-4 h-4"/> تعديل</button>
                    <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-800 p-2 rounded hover:bg-red-200 text-sm"><TrashIcon className="w-4 h-4"/> حذف</button>
                </div>
            </div>
        </div>
    );
};

// --- InventoryPage Component (default export) ---
const InventoryPage: React.FC<InventoryPageProps> = ({ products, setProducts, logUserAction }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const handleAddProduct = () => {
        setProductToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = (productId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
            const productName = products.find(p => p.id === productId)?.name;
            setProducts(prev => prev.filter(p => p.id !== productId));
            logUserAction(`حذف المنتج: ${productName}.`);
        }
    };

    const handleSaveProduct = (product: Product) => {
        const isEditing = products.some(p => p.id === product.id);
        if (isEditing) {
            setProducts(prev => prev.map(p => p.id === product.id ? product : p));
            logUserAction(`تعديل المنتج: ${product.name}.`);
        } else {
            setProducts(prev => [product, ...prev]);
            logUserAction(`إضافة منتج جديد: ${product.name}.`);
        }
    };
    
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text-primary">إدارة المخزون</h1>
                <div className="w-full md:w-auto flex gap-2">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو الكود..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 p-2 border border-border rounded-lg"
                    />
                    <button onClick={handleAddProduct} className="flex-shrink-0 flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800">
                        <PlusIcon className="w-5 h-5 ml-2" />
                        <span>منتج جديد</span>
                    </button>
                </div>
            </div>
            
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product}
                            onEdit={() => handleEditProduct(product)}
                            onDelete={() => handleDeleteProduct(product.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface rounded-lg shadow-md">
                    <p className="text-text-secondary">لا توجد منتجات تطابق بحثك. حاول تغيير كلمة البحث أو قم بإضافة منتج جديد.</p>
                </div>
            )}


            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                productToEdit={productToEdit}
            />
        </div>
    );
};

export default InventoryPage;
