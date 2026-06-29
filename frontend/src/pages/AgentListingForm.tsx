import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { ComboNumberSelect, ComboSelect } from '../components/ui/ComboSelect';
import { LoadingSpinner } from '../components/ui/Loading';
import * as propertyService from '../services/propertyService';
import * as statsService from '../services/statsService';

const CITIES = ['Karachi', 'Islamabad'] as const;
const PURPOSES = ['For Sale', 'For Rent'] as const;

const defaultForm = {
  property_type: '',
  price: '',
  location: '',
  city: 'Karachi',
  baths: '2',
  bedrooms: '3',
  area_type: '',
  area_size: '',
  area_category: '',
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

  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [areaTypes, setAreaTypes] = useState<string[]>([]);
  const [areaCategories, setAreaCategories] = useState<string[]>([]);
  const [areaSizes, setAreaSizes] = useState<number[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [areasLoading, setAreasLoading] = useState(true);

  // Load property types, area units (Marla/Kanal)
  useEffect(() => {
    Promise.all([statsService.getPropertyTypes(), statsService.getAreaTypes()])
      .then(([types, units]) => {
        setPropertyTypes(types.length ? types : ['House', 'Flat', 'Plot', 'Penthouse']);
        setAreaTypes(units.length ? units : ['Marla', 'Kanal']);
        if (!isEdit) {
          setForm((f) => ({
            ...f,
            property_type: types[0] ?? 'House',
            area_type: units[0] ?? 'Marla',
          }));
        }
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setMetaLoading(false));
  }, [isEdit]);

  // Load areas when city changes
  useEffect(() => {
    if (!form.city) return;
    let cancelled = false;
    statsService
      .getAreas(form.city)
      .then((areas) => {
        if (cancelled) return;
        const locations = [...new Set(areas.map((a) => a.location))].sort();
        setAreaOptions(locations);
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setAreasLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.city]);

  // Load categories & sizes when area type (Marla/Kanal) changes
  useEffect(() => {
    if (!form.area_type) return;
    Promise.all([
      statsService.getAreaCategories(form.area_type),
      statsService.getAreaSizes(form.area_type),
    ])
      .then(([categories, sizes]) => {
        setAreaCategories(categories);
        setAreaSizes(sizes);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [form.area_type]);

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
          area_size: String(p.area_size ?? ''),
          area_category: p.area_category ?? '',
          purpose: p.purpose ?? 'For Sale',
        }),
      )
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleCityChange = (city: string) => {
    setAreasLoading(true);
    setAreaOptions([]);
    setForm((f) => ({ ...f, city, location: '' }));
  };

  const handleAreaTypeChange = (areaType: string) => {
    setForm((f) => ({
      ...f,
      area_type: areaType,
      area_category: '',
      area_size: '',
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.property_type) e.property_type = 'Select property type';
    if (!form.location.trim()) e.location = 'Select or enter area';
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter valid price';
    if (!CITIES.includes(form.city as (typeof CITIES)[number])) e.city = 'Must be Karachi or Islamabad';
    if (!form.area_type) e.area_type = 'Select Marla or Kanal';
    if (!form.area_size || Number(form.area_size) <= 0) e.area_size = 'Enter valid area size';
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
      location: form.location.trim(),
      city: form.city,
      baths: Number(form.baths),
      bedrooms: Number(form.bedrooms),
      area_type: form.area_type,
      area_size: Number(form.area_size),
      area_category: form.area_category || undefined,
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
      <label className="text-sm font-medium text-surface-800">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setField(key, e.target.value)}
        className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
      />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  if (loading || metaLoading) {
    return (
      <AppLayout>
        <div className="mt-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container max-w-2xl">
        <h1 className="font-display text-2xl font-bold">
          {isEdit ? 'Edit Listing' : 'Add New Listing'}
        </h1>
        <p className="mt-1 text-sm text-surface-800/60">
          Options are loaded from existing listings. Choose from the list or pick &quot;Other&quot; to
          enter a custom value.
        </p>

        <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <ComboSelect
              label="Property Type"
              value={form.property_type}
              options={propertyTypes}
              onChange={(v) => setField('property_type', v)}
              error={errors.property_type}
              placeholder="Select property type…"
            />

            {field('price', 'Price (PKR)', 'number')}

            <div>
              <label className="text-sm font-medium text-surface-800">City</label>
              <select
                value={form.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            <ComboSelect
              label="Area / Location"
              value={form.location}
              options={areaOptions}
              onChange={(v) => setField('location', v)}
              error={errors.location}
              placeholder={areasLoading ? 'Loading areas…' : 'Select area for ' + form.city}
              customPlaceholder="e.g. DHA Phase 6"
              loading={areasLoading}
            />

            {field('bedrooms', 'Bedrooms', 'number')}
            {field('baths', 'Bathrooms', 'number')}

            <ComboSelect
              label="Area Unit"
              value={form.area_type}
              options={areaTypes}
              onChange={handleAreaTypeChange}
              error={errors.area_type}
              placeholder="Marla or Kanal…"
            />

            <ComboNumberSelect
              label={`Area Size (${form.area_type || 'unit'})`}
              value={form.area_size}
              options={areaSizes}
              onChange={(v) => setField('area_size', v)}
              error={errors.area_size}
              loading={!form.area_type}
            />

            <ComboSelect
              label="Area Category"
              value={form.area_category}
              options={areaCategories}
              onChange={(v) => setField('area_category', v)}
              placeholder="e.g. 5-10 Marla (optional)"
              customPlaceholder="e.g. 5-10 Marla"
              disabled={!form.area_type}
            />

            <div>
              <label className="text-sm font-medium text-surface-800">Purpose</label>
              <select
                value={form.purpose}
                onChange={(e) => setField('purpose', e.target.value)}
                className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm"
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
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
      </div>
    </AppLayout>
  );
}
