// src/pages/Invoices/InvoiceCreatePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // If needed for navigation
import { useTranslation } from 'react-i18next';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';

// Initial state for a line item
const initialLineItem = { id: Date.now(), itemName: '', itemQty: 1, itemPrice: '', itemTax: '' };

const InvoiceCreatePage = () => {
    const { t } = useTranslation();

    // --- State Variables ---
    const [invoiceType, setInvoiceType] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');

    const [lineItems, setLineItems] = useState([{ ...initialLineItem }]);

    const [invoiceNotes, setInvoiceNotes] = useState('');
    const [privateNotes, setPrivateNotes] = useState('');
    const [overallDiscountValue, setOverallDiscountValue] = useState(0);
    const [overallDiscountType, setOverallDiscountType] = useState('amount'); // 'amount' or 'percent'
    const [generateEInvoice, setGenerateEInvoice] = useState(false);


    // Calculated Totals State
    const [summary, setSummary] = useState({
        subtotal: 0,
        itemTax: 0,
        discountAmount: 0,
        grandTotal: 0,
    });

    // --- Handlers for Form Inputs ---
    const handleLineItemChange = (index, field, value) => {
        const updatedItems = [...lineItems];
        updatedItems[index][field] = value;
        setLineItems(updatedItems);
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { ...initialLineItem, id: Date.now() }]);
    };

    const removeLineItem = (index) => {
        if (lineItems.length > 1) {
            const updatedItems = lineItems.filter((_, i) => i !== index);
            setLineItems(updatedItems);
        } else {
            alert(t('invoiceCreate.alert.atLeastOneItem', "You must have at least one item."));
        }
    };

    // --- Calculation Logic ---
    const calculateTotals = useCallback(() => {
        let subtotal = 0;
        let totalItemTaxAmount = 0;

        lineItems.forEach(item => {
            const qty = parseFloat(item.itemQty) || 0;
            const price = parseFloat(item.itemPrice) || 0;
            const taxRate = parseFloat(item.itemTax) || 0;

            const itemTotalWithoutTax = qty * price;
            subtotal += itemTotalWithoutTax;
            totalItemTaxAmount += itemTotalWithoutTax * (taxRate / 100);
        });

        let discountAmount = 0;
        const discountVal = parseFloat(overallDiscountValue) || 0;
        if (overallDiscountType === 'percent') {
            discountAmount = (subtotal + totalItemTaxAmount) * (discountVal / 100);
        } else {
            discountAmount = discountVal;
        }
        // Ensure discount doesn't exceed subtotal + tax (or apply business logic)
        discountAmount = Math.min(discountAmount, subtotal + totalItemTaxAmount);


        const grandTotal = subtotal + totalItemTaxAmount - discountAmount;

        setSummary({
            subtotal: subtotal.toFixed(2),
            itemTax: totalItemTaxAmount.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            grandTotal: grandTotal.toFixed(2),
        });
    }, [lineItems, overallDiscountValue, overallDiscountType]);

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]); // Recalculate when items or discount changes


    const handleSubmit = (e) => {
        e.preventDefault();
        // Collect all form data from state and submit
        const formData = {
            invoiceType,
            customer: customerSearch || { name: customerName, phone: customerPhone, email: customerEmail, address: customerAddress },
            items: lineItems,
            notes: invoiceNotes,
            privateNotes,
            discount: { value: overallDiscountValue, type: overallDiscountType },
            generateEInvoice,
            totals: summary,
        };
        console.log("Invoice Form Data:", formData);
        alert(t('invoiceCreate.alert.formSubmitted', "Form submitted (check console for data)"));
        // Here you would typically send data to an API
    };


    // Stepper state (conceptual - for UI only in this version)
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 5;

     const stepNames = [
        t('invoiceCreate.stepper.step1Name', 'Invoice Type'),
        t('invoiceCreate.stepper.step2Name', 'Customer Details'),
        t('invoiceCreate.stepper.step3Name', 'Items/Services'),
        t('invoiceCreate.stepper.step4Name', 'Tax & Discount'),
        t('invoiceCreate.stepper.step5Name', 'Preview & Send')
    ];

 const StepperUI = ({ current, total,names }) => {
        return (
            <div className="mb-10 hidden sm:flex justify-between items-start font-sans text-sm px-4 md:px-8 lg:px-16">{/* Main flex container, justify-between spreads items */}
                {names.slice(0, total).map((translatedStepName, i) => (
                    <div
                        key={i}
                        className={`flex flex-col items-center text-center relative ${
                            i + 1 === current ? 'text-primary font-semibold' : 'text-secondary'
                        } ${
                            i + 1 < current ? 'text-primary' : ''
                        }`}
                        style={{ flexBasis: '18%' }} // Adjust flex-basis as needed for spacing
                    >
                        <div
                            className={`text-lg font-bold mb-1 ${
                                i + 1 === current ? 'text-primary' : (i + 1 < current ? 'text-primary' : 'text-gray-400')
                            }`}
                        >
                            {i + 1} {/* Display step number */}
                        </div>
                        {/* Display the already translated step name from the 'names' prop */}
                        <p className="text-xs leading-tight w-full truncate">{translatedStepName}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-heading text-primary">{t('invoiceCreate.title', 'Create New Invoice')}</h2>
                        <p className="text-secondary font-sans">{t('invoiceCreate.subtitle', 'Follow the steps below to generate an invoice.')}</p>
                    </div>

                    <StepperUI current={currentStep} total={totalSteps} names={stepNames} />

                    <form id="invoiceForm" onSubmit={handleSubmit} className="space-y-10">
                        {/* Step 1: Select Invoice Type */}
                        <section id="step1" className="dashboard-card">
                            {/* Use the translated step name from the array for the section title */}
                            <h3 className="text-xl font-heading text-primary mb-4">{stepNames[0]}</h3>
                            <div>
                                <label htmlFor="invoiceType" className="block text-sm font-medium text-primary mb-1 font-sans">{t('invoiceCreate.step1.invoiceFor')}</label>
                                <select id="invoiceType" name="invoiceType" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)} className="form-element">
                                    <option value="" disabled>{t('invoiceCreate.step1.chooseType')}</option>
                                    <option value="consultation">{t('invoiceCreate.step1.types.consultation')}</option>
                                    <option value="therapy">{t('invoiceCreate.step1.types.therapy')}</option>
                                    <option value="retail_sale">{t('invoiceCreate.step1.types.retail')}</option>
                                    <option value="batch_sale">{t('invoiceCreate.step1.types.batch')}</option>
                                </select>
                            </div>
                        </section>

                        {/* Step 2: Add Customer Details */}
                        <section id="step2" className="dashboard-card">
                            <h3 className="text-xl font-heading text-primary mb-4">{stepNames[1]}</h3>
                            {/* ... all your existing Step 2 JSX, ensure all labels use t() ... */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="customerSearch" className="block text-sm font-medium text-primary mb-1 font-sans">{t('invoiceCreate.step2.searchExisting')}</label>
                                    <input type="text" id="customerSearch" name="customerSearch" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder={t('invoiceCreate.step2.searchPlaceholder')} className="form-element" />
                                </div>
                                <p className="text-center text-secondary font-sans text-sm my-4">{t('common.or')}</p>
                                <h4 className="text-lg font-heading text-primary mb-2">{t('invoiceCreate.step2.addNewDetails')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="customerName" className="block text-sm font-medium text-primary mb-1 font-sans">{t('common.fullName')} <span className="text-danger-DEFAULT">*</span></label>
                                        <input type="text" id="customerName" name="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="form-element" />
                                    </div>
                                    <div>
                                        <label htmlFor="customerPhone" className="block text-sm font-medium text-primary mb-1 font-sans">{t('common.phoneNumber')}</label>
                                        <input type="tel" id="customerPhone" name="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="form-element" />
                                    </div>
                                    <div>
                                        <label htmlFor="customerEmail" className="block text-sm font-medium text-primary mb-1 font-sans">{t('common.emailAddress')}</label>
                                        <input type="email" id="customerEmail" name="customerEmail" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="form-element" />
                                    </div>
                                    <div>
                                        <label htmlFor="customerAddress" className="block text-sm font-medium text-primary mb-1 font-sans">{t('common.addressOptional')}</label>
                                        <textarea id="customerAddress" name="customerAddress" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows="2" className="form-element"></textarea>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Step 3: Add Items/Services */}
                        <section id="step3" className="dashboard-card">
                            <h3 className="text-xl font-heading text-primary mb-4">{stepNames[2]}</h3>
                            {/* ... (Your existing JSX for line items, ensure labels use t()) ... */}
                             <div id="invoiceItemsContainer" className="space-y-4">
                                {lineItems.map((item, index) => (
                                    <div key={item.id} className="item-row grid grid-cols-12 gap-x-3 gap-y-2 items-end p-3 bg-background rounded-lg">
                                        <div className="col-span-12 sm:col-span-5">
                                            <label className="block text-xs font-medium text-primary mb-0.5 font-sans">{t('invoiceCreate.step3.itemName')}</label>
                                            <input type="text" name="itemName" value={item.itemName} onChange={(e) => handleLineItemChange(index, 'itemName', e.target.value)} placeholder={t('invoiceCreate.step3.itemPlaceholder')} className="form-element !p-2 text-sm" />
                                        </div>
                                        <div className="col-span-4 sm:col-span-2">
                                            <label className="block text-xs font-medium text-primary mb-0.5 font-sans">{t('invoiceCreate.step3.qty')}</label>
                                            <input type="number" name="itemQty" value={item.itemQty} onChange={(e) => handleLineItemChange(index, 'itemQty', e.target.value)} min="1" className="form-element !p-2 text-sm" />
                                        </div>
                                        <div className="col-span-4 sm:col-span-2">
                                            <label className="block text-xs font-medium text-primary mb-0.5 font-sans">{t('invoiceCreate.step3.price')}</label>
                                            <input type="number" name="itemPrice" value={item.itemPrice} onChange={(e) => handleLineItemChange(index, 'itemPrice', e.target.value)} placeholder="0.00" step="0.01" className="form-element !p-2 text-sm" />
                                        </div>
                                        <div className="col-span-4 sm:col-span-2">
                                            <label className="block text-xs font-medium text-primary mb-0.5 font-sans">{t('invoiceCreate.step3.tax')}</label>
                                            <input type="number" name="itemTax" value={item.itemTax} onChange={(e) => handleLineItemChange(index, 'itemTax', e.target.value)} placeholder="e.g., 18" className="form-element !p-2 text-sm" />
                                        </div>
                                        <div className="col-span-12 sm:col-span-1 flex justify-end sm:justify-start">
                                            <button type="button" className="text-danger-DEFAULT hover:text-danger-dark p-1" onClick={() => removeLineItem(index)}>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addLineItem} className="mt-4 font-sans text-sm bg-primary hover:bg-primary-dark text-textOnPrimary px-4 py-2 rounded-lg shadow-soft transition-colors duration-200 flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                <span>{t('invoiceCreate.step3.addItemBtn')}</span>
                            </button>
                        </section>

                        {/* e-Invoicing Option */}
                        <section className="dashboard-card">
                             <h3 className="text-xl font-heading text-primary mb-4">{t('invoiceCreate.eInvoiceOption.title')}</h3>
                             <div id="eInvoiceOptionCreate" className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" id="generateEInvoice" name="generateEInvoice" checked={generateEInvoice} onChange={(e) => setGenerateEInvoice(e.target.checked)} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-md font-medium text-primary font-sans">{t('invoiceCreate.eInvoiceOption.generateLabel')}</span>
                                </label>
                                <p className="text-xs text-secondary mt-1 pl-8">{t('invoiceCreate.eInvoiceOption.description')}</p>
                            </div>
                        </section>

                        {/* Section for Totals, Discount, Notes */}
                        <section className="dashboard-card">
                            <h3 className="text-xl font-heading text-primary mb-4">{stepNames[3]}</h3>
                            {/* ... (Your existing JSX for totals, ensure labels use t()) ... */}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <label htmlFor="invoiceNotes" className="block text-sm font-medium text-primary mb-1 font-sans">{t('invoiceCreate.totalsSection.notesLabel')}</label>
                                        <textarea id="invoiceNotes" name="invoiceNotes" value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)} rows="3" placeholder={t('invoiceCreate.totalsSection.notesPlaceholder')} className="form-element"></textarea>
                                    </div>
                                    <div>
                                        <label htmlFor="privateNotes" className="block text-sm font-medium text-primary mb-1 font-sans">{t('invoiceCreate.totalsSection.privateNotesLabel')}</label>
                                        <textarea id="privateNotes" name="privateNotes" value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} rows="2" placeholder={t('invoiceCreate.totalsSection.privateNotesPlaceholder')} className="form-element"></textarea>
                                    </div>
                                </div>
                                <div className="md:col-span-1 space-y-3 pt-2 font-sans text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-secondary">{t('invoiceCreate.summary.subtotal')}</span>
                                        <span className="font-semibold text-primary">₹{summary.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-secondary">{t('invoiceCreate.summary.itemTax')}</span>
                                        <span className="font-semibold text-primary">₹{summary.itemTax}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="overallDiscountValue" className="text-secondary">{t('invoiceCreate.summary.overallDiscount')}</label>
                                        <div className="flex w-1/2">
                                            <input type="number" id="overallDiscountValue" name="overallDiscountValue" value={overallDiscountValue} onChange={(e) => setOverallDiscountValue(e.target.value)} className="form-element !p-1.5 text-right rounded-r-none item-discount-value" style={{ maxWidth: '70px' }} />
                                            <select id="overallDiscountType" name="overallDiscountType" value={overallDiscountType} onChange={(e) => setOverallDiscountType(e.target.value)} className="form-element !p-1.5 rounded-l-none border-l-0 item-discount-type" style={{ maxWidth: '50px' }}>
                                                <option value="amount">₹</option>
                                                <option value="percent">%</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-secondary">{t('invoiceCreate.summary.calculatedDiscount')}</span>
                                        <span className="font-semibold text-primary">- ₹{summary.discountAmount}</span>
                                    </div>
                                    <hr className="border-borderDefault my-2" />
                                    <div className="flex justify-between items-center text-xl">
                                        <span className="font-heading text-primary">{t('invoiceCreate.summary.grandTotal')}</span>
                                        <span className="font-heading text-primary font-bold">₹{summary.grandTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Step 5: Preview & Generate Invoice */}
                        <section id="step5" className="dashboard-card">
                            <h3 className="text-xl font-heading text-primary mb-4">{stepNames[4]}</h3>
                             <div className="mb-6 p-4 border border-borderDefault rounded-lg bg-background min-h-[200px]">
                                <p className="text-center text-secondary font-sans">{t('invoiceCreate.step5.previewPlaceholder')}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                                <button type="button" className="font-sans bg-secondary hover:bg-secondary/80 text-textOnSecondary px-6 py-3 rounded-lg shadow-soft transition-colors duration-200 flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    <span>{t('actions.downloadPDF')}</span>
                                </button>
                                <button type="submit" className="font-sans bg-primary hover:bg-primary-dark text-textOnPrimary px-6 py-3 rounded-lg shadow-soft transition-colors duration-200 flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <span>{t('invoiceCreate.actions.generateAndSend')}</span>
                                </button>
                            </div>
                        </section>
                    </form>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default InvoiceCreatePage;