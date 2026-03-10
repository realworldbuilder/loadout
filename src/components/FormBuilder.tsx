'use client';

import { useState, useEffect } from 'react';
import { FormField, FormTemplate, FORM_TEMPLATES } from '@/lib/formTemplates';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Save, 
  Settings, 
  Type, 
  AlignLeft, 
  ChevronDown as ChevronDownIcon,
  CheckSquare,
  Circle,
  Upload,
  X
} from 'lucide-react';

interface FormBuilderProps {
  creatorId: string;
  onSave?: () => void;
}

interface ApplicationForm {
  id?: string;
  creator_id: string;
  name: string;
  intro_text: string | null;
  confirmation_text: string;
  fields: FormField[];
}

const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'text input', icon: Type },
  { value: 'textarea', label: 'textarea', icon: AlignLeft },
  { value: 'dropdown', label: 'dropdown', icon: ChevronDownIcon },
  { value: 'radio', label: 'radio buttons', icon: Circle },
  { value: 'checkboxes', label: 'checkboxes', icon: CheckSquare },
  { value: 'photo_upload', label: 'photo upload', icon: Upload },
];

export default function FormBuilder({ creatorId, onSave }: FormBuilderProps) {
  const [currentForm, setCurrentForm] = useState<ApplicationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchExistingForm();
  }, [creatorId]);

  const fetchExistingForm = async () => {
    try {
      const response = await fetch(`/api/application-forms?creator_id=${creatorId}`);
      const result = await response.json();
      
      if (result.data) {
        setCurrentForm(result.data);
      } else {
        // No form exists, show template picker
        setShowTemplatePicker(true);
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      setShowTemplatePicker(true);
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template: FormTemplate) => {
    const newForm: ApplicationForm = {
      creator_id: creatorId,
      name: template.name,
      intro_text: template.introText,
      confirmation_text: template.confirmationText,
      fields: [...template.fields], // Deep copy
    };
    setCurrentForm(newForm);
    setShowTemplatePicker(false);
  };

  const addField = () => {
    if (!currentForm) return;

    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      label: 'new field',
      required: false,
    };

    setCurrentForm({
      ...currentForm,
      fields: [...currentForm.fields, newField],
    });
    setEditingField(newField.id);
  };

  const deleteField = (fieldId: string) => {
    if (!currentForm) return;
    
    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.filter(f => f.id !== fieldId),
    });
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    if (!currentForm) return;

    const fields = [...currentForm.fields];
    const index = fields.findIndex(f => f.id === fieldId);
    
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    }

    setCurrentForm({ ...currentForm, fields });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!currentForm) return;

    setCurrentForm({
      ...currentForm,
      fields: currentForm.fields.map(f =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
    });
  };

  const addOption = (fieldId: string) => {
    if (!currentForm) return;

    const field = currentForm.fields.find(f => f.id === fieldId);
    if (!field) return;

    updateField(fieldId, {
      options: [...(field.options || []), 'new option'],
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    if (!currentForm) return;

    const field = currentForm.fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldId, { options: newOptions });
  };

  const deleteOption = (fieldId: string, optionIndex: number) => {
    if (!currentForm) return;

    const field = currentForm.fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;

    updateField(fieldId, {
      options: field.options.filter((_, i) => i !== optionIndex),
    });
  };

  const saveForm = async () => {
    if (!currentForm) return;

    setSaving(true);
    try {
      const url = currentForm.id ? '/api/application-forms' : '/api/application-forms';
      const method = currentForm.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentForm),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentForm(result.data);
        onSave?.();
        alert('form saved successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('failed to save form. please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-white/60 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showTemplatePicker) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white lowercase mb-2">choose a template</h1>
          <p className="text-white/60 lowercase">pick a starting point for your application form</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FORM_TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => selectTemplate(template)}
              className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-xl text-left hover:bg-white/[0.06] transition-colors group"
            >
              <h3 className="text-lg font-semibold text-white mb-2 lowercase group-hover:text-emerald-400 transition-colors">
                {template.name}
              </h3>
              <p className="text-white/60 text-sm lowercase mb-3">{template.description}</p>
              <p className="text-white/40 text-xs">
                {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (previewMode && currentForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white lowercase">form preview</h2>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            back to editor
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          {currentForm.intro_text && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-emerald-400">{currentForm.intro_text}</p>
            </div>
          )}

          <div className="space-y-6">
            {currentForm.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-white/80 text-sm font-medium mb-2 lowercase">
                  {field.label} {field.required && '*'}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                    disabled
                  />
                )}

                {field.type === 'dropdown' && (
                  <select
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled
                  >
                    <option value="">select an option</option>
                    {field.options?.map((option, i) => (
                      <option key={i} value={option}>{option}</option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {field.options?.map((option, i) => (
                      <label key={i} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <input type="radio" name={field.id} disabled className="w-4 h-4 text-emerald-500" />
                        <span className="text-white/80">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'checkboxes' && (
                  <div className="grid grid-cols-2 gap-2">
                    {field.options?.map((option, i) => (
                      <label key={i} className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg border border-white/10">
                        <input type="checkbox" disabled className="w-4 h-4 text-emerald-500" />
                        <span className="text-white/80 text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'photo_upload' && (
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">click to upload photo</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <button
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
              disabled
            >
              submit application
            </button>
          </div>

          <div className="mt-6 p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg">
            <p className="text-white/60 text-sm">{currentForm.confirmation_text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentForm) {
    return (
      <div className="text-center py-16">
        <p className="text-white/60 mb-4">no form found</p>
        <button
          onClick={() => setShowTemplatePicker(true)}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
        >
          create form
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white lowercase mb-2">application form builder</h1>
          <p className="text-white/60 lowercase">customize your coaching application form</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(true)}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            preview
          </button>
          <button
            onClick={saveForm}
            disabled={saving}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'saving...' : 'save'}
          </button>
        </div>
      </div>

      {/* Form Settings */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 lowercase flex items-center gap-2">
          <Settings className="h-5 w-5" />
          form settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2 lowercase">form name</label>
            <input
              type="text"
              value={currentForm.name}
              onChange={(e) => setCurrentForm({ ...currentForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="coaching application"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2 lowercase">intro text</label>
            <textarea
              value={currentForm.intro_text || ''}
              onChange={(e) => setCurrentForm({ ...currentForm, intro_text: e.target.value || null })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
              placeholder="text shown at the top of your application form"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2 lowercase">confirmation message</label>
            <input
              type="text"
              value={currentForm.confirmation_text}
              onChange={(e) => setCurrentForm({ ...currentForm, confirmation_text: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="message shown after form submission"
            />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 lowercase">form fields</h3>

        <div className="space-y-3">
          {currentForm.fields.map((field, index) => (
            <div key={field.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
              {editingField === field.id ? (
                <FieldEditor
                  field={field}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onSave={() => setEditingField(null)}
                  onCancel={() => setEditingField(null)}
                  onAddOption={() => addOption(field.id)}
                  onUpdateOption={updateOption}
                  onDeleteOption={deleteOption}
                />
              ) : (
                <FieldDisplay
                  field={field}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === currentForm.fields.length - 1}
                  onEdit={() => setEditingField(field.id)}
                  onDelete={() => deleteField(field.id)}
                  onMove={(direction) => moveField(field.id, direction)}
                />
              )}
            </div>
          ))}

          <button
            onClick={addField}
            className="w-full p-4 border-2 border-dashed border-white/20 rounded-lg hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors flex items-center justify-center gap-2 text-white/60 hover:text-emerald-400"
          >
            <Plus className="h-5 w-5" />
            add field
          </button>
        </div>
      </div>
    </div>
  );
}

interface FieldDisplayProps {
  field: FormField;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

function FieldDisplay({ field, index, isFirst, isLast, onEdit, onDelete, onMove }: FieldDisplayProps) {
  const fieldTypeOption = FIELD_TYPE_OPTIONS.find(opt => opt.value === field.type);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 bg-white/10 rounded text-white/60 text-xs flex items-center justify-center font-medium">
          {index + 1}
        </span>
        <div>
          <span className="text-white font-medium lowercase">{field.label}</span>
          {field.required && <span className="text-red-400 ml-1">*</span>}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-white/40 text-xs lowercase">{fieldTypeOption?.label}</span>
            {field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkboxes' ? (
              <span className="text-white/30 text-xs">({field.options?.length || 0} options)</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onMove('up')}
          disabled={isFirst}
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMove('down')}
          disabled={isLast}
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={onEdit}
          className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface FieldEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onSave: () => void;
  onCancel: () => void;
  onAddOption: () => void;
  onUpdateOption: (fieldId: string, optionIndex: number, value: string) => void;
  onDeleteOption: (fieldId: string, optionIndex: number) => void;
}

function FieldEditor({ field, onUpdate, onSave, onCancel, onAddOption, onUpdateOption, onDeleteOption }: FieldEditorProps) {
  const requiresOptions = ['dropdown', 'radio', 'checkboxes'].includes(field.type);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2 lowercase">field type</label>
          <select
            value={field.type}
            onChange={(e) => onUpdate({ type: e.target.value as FormField['type'] })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {FIELD_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2 lowercase">label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="field label"
          />
        </div>
      </div>

      {(field.type === 'text' || field.type === 'textarea') && (
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2 lowercase">placeholder</label>
          <input
            type="text"
            value={field.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="placeholder text"
          />
        </div>
      )}

      <div className="flex items-center space-x-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="w-4 h-4 text-emerald-500 bg-transparent border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
          />
          <span className="text-white/80 text-sm lowercase">required field</span>
        </label>
      </div>

      {requiresOptions && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/80 text-sm font-medium lowercase">options</label>
            <button
              onClick={onAddOption}
              className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm rounded-lg hover:bg-emerald-500/30 transition-colors"
            >
              add option
            </button>
          </div>
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => onUpdateOption(field.id, index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="option text"
                />
                <button
                  onClick={() => onDeleteOption(field.id, index)}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
        >
          save field
        </button>
      </div>
    </div>
  );
}