'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';
import { Creator } from '@/lib/supabase';
import { FormField } from '@/lib/formTemplates';

interface ApplicationForm {
  id: string;
  creator_id: string;
  name: string;
  intro_text: string | null;
  confirmation_text: string;
  fields: FormField[];
}

interface DynamicApplicationFormProps {
  creator: Creator;
}

export default function DynamicApplicationForm({ creator }: DynamicApplicationFormProps) {
  const [form, setForm] = useState<ApplicationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Group fields into steps (3-4 fields per step)
  const FIELDS_PER_STEP = 4;
  const steps = form ? Math.ceil(form.fields.length / FIELDS_PER_STEP) : 0;
  const currentFields = form ? form.fields.slice(
    (currentStep - 1) * FIELDS_PER_STEP,
    currentStep * FIELDS_PER_STEP
  ) : [];

  useEffect(() => {
    fetchApplicationForm();
  }, [creator.id]);

  const fetchApplicationForm = async () => {
    try {
      const response = await fetch(`/api/application-forms?creator_id=${creator.id}`);
      const result = await response.json();
      
      if (result.data) {
        setForm(result.data);
      } else {
        // No form configured
        setForm(null);
      }
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateStep = (): boolean => {
    const stepErrors: Record<string, string> = {};
    
    currentFields.forEach(field => {
      const value = formData[field.id];
      
      if (field.required) {
        if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) {
          stepErrors[field.id] = `${field.label} is required`;
        }
      }
      
      // Email validation
      if (field.label.toLowerCase().includes('email') && value && typeof value === 'string') {
        if (!/\S+@\S+\.\S+/.test(value)) {
          stepErrors[field.id] = 'Please enter a valid email';
        }
      }
    });
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/coaching-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator_id: creator.id,
          form_id: form?.id,
          form_data: formData,
          // Extract common fields for backward compatibility
          name: formData[getFieldByLabel('name')?.id || ''] || '',
          email: formData[getFieldByLabel('email')?.id || ''] || '',
          // Add other commonly used fields
          ...extractCommonFields(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldByLabel = (label: string): FormField | undefined => {
    return form?.fields.find(field => field.label.toLowerCase().includes(label.toLowerCase()));
  };

  const extractCommonFields = () => {
    const commonFields: any = {};
    
    // Map common field labels to database columns
    const fieldMapping: Record<string, string> = {
      'age': 'age',
      'location': 'location',
      'city': 'location',
      'instagram': 'instagram',
      'phone': 'phone',
      'goal': 'goals',
      'experience': 'experience',
      'gym': 'gym_type',
      'macro': 'tracked_macros',
      'weight': 'current_weight',
      'height': 'current_height',
    };

    form?.fields.forEach(field => {
      const value = formData[field.id];
      if (value) {
        // Find matching database column
        const dbColumn = Object.keys(fieldMapping).find(key => 
          field.label.toLowerCase().includes(key)
        );
        
        if (dbColumn) {
          commonFields[fieldMapping[dbColumn]] = value;
        }
      }
    });

    return commonFields;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white/60 border-t-transparent rounded-full" />
      </div>
    );
  }

  // No form configured
  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4 lowercase">applications coming soon</h1>
          <p className="text-white/60 mb-6 lowercase">
            {creator.display_name} is setting up their coaching application form.
          </p>
          <button
            onClick={() => window.location.href = `/${creator.handle}`}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors lowercase"
          >
            back to profile
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 lowercase">{form.confirmation_text}</h1>
          <button
            onClick={() => window.location.href = `/${creator.handle}`}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors lowercase"
          >
            back to profile
          </button>
        </div>
      </div>
    );
  }

  const progress = (currentStep / steps) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-white/10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-lg font-bold">
                  {creator.display_name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white lowercase">{form.name}</h1>
              <p className="text-white/60 text-sm lowercase">step {currentStep} of {steps}</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Intro text */}
      {currentStep === 1 && form.intro_text && (
        <div className="px-4 py-6 bg-emerald-500/5 border-b border-emerald-500/20">
          <div className="max-w-2xl mx-auto">
            <p className="text-emerald-400 font-medium lowercase">{form.intro_text}</p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {currentFields.map((field) => (
            <div key={field.id}>
              <label className="block text-white/80 text-sm font-medium mb-2 lowercase">
                {field.label} {field.required && '*'}
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  value={formData[field.id] || ''}
                  onChange={(e) => updateFormData(field.id, e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors[field.id] ? 'border-red-500' : 'border-white/10'}`}
                  placeholder={field.placeholder}
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  value={formData[field.id] || ''}
                  onChange={(e) => updateFormData(field.id, e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none ${errors[field.id] ? 'border-red-500' : 'border-white/10'}`}
                  placeholder={field.placeholder}
                />
              )}

              {field.type === 'dropdown' && (
                <select
                  value={formData[field.id] || ''}
                  onChange={(e) => updateFormData(field.id, e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors[field.id] ? 'border-red-500' : 'border-white/10'}`}
                >
                  <option value="">select an option</option>
                  {field.options?.map((option, i) => (
                    <option key={i} value={option} className="bg-gray-800">{option}</option>
                  ))}
                </select>
              )}

              {field.type === 'radio' && (
                <div className="space-y-2">
                  {field.options?.map((option, i) => (
                    <label key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer border border-white/10">
                      <input
                        type="radio"
                        name={field.id}
                        value={option}
                        checked={formData[field.id] === option}
                        onChange={(e) => updateFormData(field.id, e.target.value)}
                        className="w-4 h-4 text-emerald-500 bg-transparent border-white/40 focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className="text-white/80">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'checkboxes' && (
                <div className="grid grid-cols-2 gap-2">
                  {field.options?.map((option, i) => (
                    <label key={i} className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer border border-white/10">
                      <input
                        type="checkbox"
                        checked={(formData[field.id] || []).includes(option)}
                        onChange={(e) => {
                          const current = formData[field.id] || [];
                          if (e.target.checked) {
                            updateFormData(field.id, [...current, option]);
                          } else {
                            updateFormData(field.id, current.filter((v: string) => v !== option));
                          }
                        }}
                        className="w-4 h-4 text-emerald-500 bg-transparent border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className="text-white/80 text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'photo_upload' && (
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm lowercase">photo upload coming soon</p>
                </div>
              )}

              {errors[field.id] && <p className="text-red-400 text-sm mt-1">{errors[field.id]}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-4 py-6 border-t border-white/10 bg-black/20">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors lowercase"
          >
            <ArrowLeft className="h-4 w-4" />
            back
          </button>

          {currentStep < steps ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors lowercase"
            >
              continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed lowercase"
            >
              {isSubmitting ? 'submitting...' : 'submit application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}