import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { LoadingSpinner } from '../components/ui/Loading';
import * as propertyService from '../services/propertyService';

const defaultForm = {
  property_type: 'House',
  price: '',
  location: '',
  city: 'Karachi',
  baths: '2',
  bedrooms: '3',
  area_type: 'Marla',
  area_size: '5',
  area_category: '5-10 Marla',
  purpose: 'For Sale',
};

export function AgentListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    propertyService
      .getProperty(Number(id))
      .then((p) =>
        setForm({
          property_type: p.property_type,
          price: String(p.price),
          location: p.location,
          city: p.city,
          baths: String(p.baths ?? 0),
          bedrooms: String(p.bedrooms ?? 0),
          area_type: p.area_type ?? 'Marla',
          area_size: String(p.area_size ?? 5),
          area_category: p.area_category ?? '',
          purpose: p.purpose ?? 'For Sale',
        }),
      )
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.location) e.location = 'Required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter valid price';
    if (!['Karachi', 'Islamabad'].includes(form.city)) e.city = 'Must be Karachi or Islamabad';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      property_type: form.property_type,
      price: Number(form.price),
      location: form.location,
      city: form.city,
      baths: Number(form.baths),
      bedrooms: Number(form.bedrooms),
      area_type: form.area_type,
      area_size: Number(form.area_size),
      area_category: form.area_category,
      purpose: form.purpose,
    };
    try {
      if (isEdit) {
        await propertyService.updateProperty(Number(id), payload);
        toast.success('Listing updated');
      } else {
        await propertyService.createProperty(payload);
        toast.success('Listing created');
      }
      navigate('/agent');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text') => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
      />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <AppLayout>
      <div className="page-container max-w-2xl">
        <h1 className="font-display text-2xl font-bold">
          {isEdit ? 'Edit Listing' : 'Add New Listing'}
        </h1>
        {loading ? (
          <div className="mt-10 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {field('property_type', 'Property Type')}
              {field('price', 'Price (PKR)', 'number')}
              {field('location', 'Location')}
              <div>
                <label className="text-sm font-medium">City</label>
                <select
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm"
                >
                  <option>Karachi</option>
                  <option>Islamabad</option>
                </select>
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>
              {field('bedrooms', 'Bedrooms', 'number')}
              {field('baths', 'Baths', 'number')}
              {field('area_type', 'Area Type')}
              {field('area_size', 'Area Size', 'number')}
              {field('area_category', 'Area Category')}
              {field('purpose', 'Purpose')}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {saving && <LoadingSpinner size="sm" />}
              {isEdit ? 'Update Listing' : 'Create Listing'}
            </button>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
