'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';
import { Creator } from '@/lib/supabase';

interface FormData {
  // Step 1: Basics
  name: string;
  email: string;
  phone: string;
  instagram: string;
  age: number | null;
  location: string;
  how_found: string;
  
  // Step 2: Goals & Mindset
  goals: string;
  why_important: string;
  holding_back: string;
  
  // Step 3: Fitness Background
  experience: string;
  training_focus: string[];
  training_days_per_week: number | null;
  preferred_days: string[];
  gym_type: string;
  equipment: string;
  
  // Step 4: Nutrition
  tracked_macros: string;
  food_allergies: string;
  has_food_scale: boolean | null;
  
  // Step 5: Commitment
  current_weight: string;
  current_height: string;
  commitment_ready: boolean | null;
  why_this_coach: string;
  photo_urls: string[];
}

interface CoachingApplicationFormProps {
  creator: Creator;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  phone: '',
  instagram: '',
  age: null,
  location: '',
  how_found: '',
  goals: '',
  why_important: '',
  holding_back: '',
  experience: '',
  training_focus: [],
  training_days_per_week: null,
  preferred_days: [],
  gym_type: '',
  equipment: '',
  tracked_macros: '',
  food_allergies: '',
  has_food_scale: null,
  current_weight: '',
  current_height: '',
  commitment_ready: null,
  why_this_coach: '',
  photo_urls: []
};

const HOW_FOUND_OPTIONS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Friend/Family referral',
  'Google search',
  'Other social media',
  'Other'
];

const EXPERIENCE_LEVELS = [
  'Complete beginner (never worked out)',
  'Beginner (some experience)',
  'Intermediate (1-2 years)',
  'Advanced (3+ years)',
  'Very experienced (5+ years)'
];

const TRAINING_FOCUS_OPTIONS = [
  'Weight loss',
  'Muscle building',
  'Strength training',
  'Cardio/endurance',
  'Athletic performance',
  'General fitness',
  'Injury recovery'
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const GYM_TYPES = [
  'Commercial gym',
  'Home gym',
  'Outdoor workouts',
  'Mix of home and gym'
];

export default function CoachingApplicationForm({ creator }: CoachingApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  // Get application settings with defaults
  const settings = creator.application_settings || {
    welcome_message: "Proud of you for taking this step towards transforming your body and mind.",
    show_pricing: false,
    pricing_text: "",
    response_time: "I will get back to you within 24-48hrs"
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) stepErrors.name = 'Name is required';
        if (!formData.email.trim()) stepErrors.email = 'Email is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          stepErrors.email = 'Please enter a valid email';
        }
        if (!formData.age) stepErrors.age = 'Age is required';
        if (!formData.location.trim()) stepErrors.location = 'Location is required';
        if (!formData.how_found) stepErrors.how_found = 'Please select how you found this coach';
        break;
      case 2:
        if (!formData.goals.trim()) stepErrors.goals = 'Please share your main goal';
        if (!formData.why_important.trim()) stepErrors.why_important = 'Please explain why this is important to you';
        if (!formData.holding_back.trim()) stepErrors.holding_back = 'Please share what\'s been holding you back';
        break;
      case 3:
        if (!formData.experience) stepErrors.experience = 'Please select your experience level';
        if (formData.training_focus.length === 0) stepErrors.training_focus = 'Please select at least one training focus';
        if (!formData.training_days_per_week) stepErrors.training_days_per_week = 'Please select how many days you can train';
        if (formData.preferred_days.length === 0) stepErrors.preferred_days = 'Please select your preferred training days';
        if (!formData.gym_type) stepErrors.gym_type = 'Please select your gym type';
        break;
      case 4:
        if (!formData.tracked_macros) stepErrors.tracked_macros = 'Please let us know about your macro tracking experience';
        if (formData.has_food_scale === null) stepErrors.has_food_scale = 'Please let us know if you have a food scale';
        break;
      case 5:
        if (!formData.current_weight.trim()) stepErrors.current_weight = 'Current weight is required';
        if (!formData.current_height.trim()) stepErrors.current_height = 'Current height is required';
        if (formData.commitment_ready === null) stepErrors.commitment_ready = 'Please confirm if you\'re ready to commit';
        if (!formData.why_this_coach.trim()) stepErrors.why_this_coach = 'Please explain why you want to work with this coach specifically';
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/coaching-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator_id: creator.id,
          ...formData,
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Application Submitted!</h1>
          <p className="text-white/60 mb-6">
            Thank you for applying to work with {creator.display_name}. {settings.response_time}
          </p>
          <button
            onClick={() => window.location.href = `/${creator.handle}`}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-white">Apply to work with {creator.display_name}</h1>
              <p className="text-white/60 text-sm">Step {currentStep} of {totalSteps}</p>
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

      {/* Welcome message and pricing */}
      {currentStep === 1 && (
        <div className="px-4 py-6 bg-emerald-500/5 border-b border-emerald-500/20">
          <div className="max-w-2xl mx-auto">
            <p className="text-emerald-400 font-medium">{settings.welcome_message}</p>
            {settings.show_pricing && settings.pricing_text && (
              <p className="text-white/60 mt-2">{settings.pricing_text}</p>
            )}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Let's start with the basics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.name ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Age *</label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => updateFormData('age', parseInt(e.target.value) || null)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.age ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="25"
                    min="13"
                    max="120"
                  />
                  {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Instagram Handle</label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => updateFormData('instagram', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="@yourhandle"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">City, State *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.location ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="Los Angeles, CA"
                />
                {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">How did you find me? *</label>
                <select
                  value={formData.how_found}
                  onChange={(e) => updateFormData('how_found', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.how_found ? 'border-red-500' : 'border-white/10'}`}
                >
                  <option value="">Select an option</option>
                  {HOW_FOUND_OPTIONS.map(option => (
                    <option key={option} value={option} className="bg-gray-800">{option}</option>
                  ))}
                </select>
                {errors.how_found && <p className="text-red-400 text-sm mt-1">{errors.how_found}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Goals & Mindset */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Goals & Mindset</h2>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">What's your main goal? *</label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => updateFormData('goals', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none ${errors.goals ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="Describe your primary fitness goal..."
                />
                {errors.goals && <p className="text-red-400 text-sm mt-1">{errors.goals}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Why is this important to you? *</label>
                <textarea
                  value={formData.why_important}
                  onChange={(e) => updateFormData('why_important', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none ${errors.why_important ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="What's driving you to make this change?"
                />
                {errors.why_important && <p className="text-red-400 text-sm mt-1">{errors.why_important}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">What's been holding you back? *</label>
                <textarea
                  value={formData.holding_back}
                  onChange={(e) => updateFormData('holding_back', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none ${errors.holding_back ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="What obstacles have you faced in reaching your goals?"
                />
                {errors.holding_back && <p className="text-red-400 text-sm mt-1">{errors.holding_back}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Fitness Background */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Fitness Background</h2>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Experience Level *</label>
                <select
                  value={formData.experience}
                  onChange={(e) => updateFormData('experience', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.experience ? 'border-red-500' : 'border-white/10'}`}
                >
                  <option value="">Select your experience level</option>
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level} className="bg-gray-800">{level}</option>
                  ))}
                </select>
                {errors.experience && <p className="text-red-400 text-sm mt-1">{errors.experience}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Training Focus (select all that apply) *</label>
                <div className="grid grid-cols-2 gap-2">
                  {TRAINING_FOCUS_OPTIONS.map(focus => (
                    <label key={focus} className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer border border-white/10">
                      <input
                        type="checkbox"
                        checked={formData.training_focus.includes(focus)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData('training_focus', [...formData.training_focus, focus]);
                          } else {
                            updateFormData('training_focus', formData.training_focus.filter(f => f !== focus));
                          }
                        }}
                        className="w-4 h-4 text-emerald-500 bg-transparent border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className="text-white/80 text-sm">{focus}</span>
                    </label>
                  ))}
                </div>
                {errors.training_focus && <p className="text-red-400 text-sm mt-1">{errors.training_focus}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">How many days per week can you train? *</label>
                <select
                  value={formData.training_days_per_week || ''}
                  onChange={(e) => updateFormData('training_days_per_week', parseInt(e.target.value) || null)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.training_days_per_week ? 'border-red-500' : 'border-white/10'}`}
                >
                  <option value="">Select days per week</option>
                  {[1, 2, 3, 4, 5, 6, 7].map(days => (
                    <option key={days} value={days} className="bg-gray-800">{days} day{days > 1 ? 's' : ''}</option>
                  ))}
                </select>
                {errors.training_days_per_week && <p className="text-red-400 text-sm mt-1">{errors.training_days_per_week}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Preferred training days *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <label key={day} className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer border border-white/10">
                      <input
                        type="checkbox"
                        checked={formData.preferred_days.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData('preferred_days', [...formData.preferred_days, day]);
                          } else {
                            updateFormData('preferred_days', formData.preferred_days.filter(d => d !== day));
                          }
                        }}
                        className="w-4 h-4 text-emerald-500 bg-transparent border-white/40 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className="text-white/80 text-sm">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
                {errors.preferred_days && <p className="text-red-400 text-sm mt-1">{errors.preferred_days}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Where do you train? *</label>
                <select
                  value={formData.gym_type}
                  onChange={(e) => updateFormData('gym_type', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.gym_type ? 'border-red-500' : 'border-white/10'}`}
                >
                  <option value="">Select gym type</option>
                  {GYM_TYPES.map(type => (
                    <option key={type} value={type} className="bg-gray-800">{type}</option>
                  ))}
                </select>
                {errors.gym_type && <p className="text-red-400 text-sm mt-1">{errors.gym_type}</p>}
              </div>

              {(formData.gym_type === 'Home gym' || formData.gym_type === 'Mix of home and gym') && (
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">What equipment do you have at home?</label>
                  <textarea
                    value={formData.equipment}
                    onChange={(e) => updateFormData('equipment', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
                    placeholder="List your available equipment (dumbbells, resistance bands, etc.)"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Nutrition */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Nutrition</h2>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Have you tracked macros before? *</label>
                <div className="space-y-2">
                  {[
                    'Never tracked macros',
                    'Tried but found it difficult',
                    'Yes, with some success',
                    'Yes, very experienced with tracking'
                  ].map(option => (
                    <label key={option} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer border border-white/10">
                      <input
                        type="radio"
                        name="tracked_macros"
                        value={option}
                        checked={formData.tracked_macros === option}
                        onChange={(e) => updateFormData('tracked_macros', e.target.value)}
                        className="w-4 h-4 text-emerald-500 bg-transparent border-white/40 focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className="text-white/80">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.tracked_macros && <p className="text-red-400 text-sm mt-1">{errors.tracked_macros}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Do you have any food allergies or dietary restrictions?</label>
                <textarea
                  value={formData.food_allergies}
                  onChange={(e) => updateFormData('food_allergies', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
                  placeholder="List any allergies, intolerances, or dietary preferences..."
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Do you own a food scale? *</label>
                <div className="space-y-2">
                  {[
                    { label: 'Yes, I have a food scale', value: true },
                    { label: 'No, but willing to get one', value: false },
                    { label: 'No, and prefer not to use one', value: false }
                  ].map(option => (
                    <label key={option.label} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer border border-white/10">
                      <input
                        type="radio"
                        name="has_food_scale"
                        value={option.value.toString()}
                        checked={formData.has_food_scale === option.value}
                        onChange={() => updateFormData('has_food_scale', option.value)}
                        className="w-4 h-4 text-emerald-500 bg-transparent border-white/40 focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className="text-white/80">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.has_food_scale && <p className="text-red-400 text-sm mt-1">{errors.has_food_scale}</p>}
              </div>
            </div>
          )}

          {/* Step 5: Commitment */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Commitment</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Current Weight *</label>
                  <input
                    type="text"
                    value={formData.current_weight}
                    onChange={(e) => updateFormData('current_weight', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.current_weight ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="e.g., 150 lbs"
                  />
                  {errors.current_weight && <p className="text-red-400 text-sm mt-1">{errors.current_weight}</p>}
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Current Height *</label>
                  <input
                    type="text"
                    value={formData.current_height}
                    onChange={(e) => updateFormData('current_height', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.current_height ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="e.g., 5'6&quot;"
                  />
                  {errors.current_height && <p className="text-red-400 text-sm mt-1">{errors.current_height}</p>}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Are you ready to fully commit to this transformation? *</label>
                <div className="space-y-2">
                  {[
                    { label: 'Yes, I\'m 100% committed', value: true },
                    { label: 'I think so, but have some concerns', value: false },
                    { label: 'I\'m not sure yet', value: false }
                  ].map(option => (
                    <label key={option.label} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer border border-white/10">
                      <input
                        type="radio"
                        name="commitment_ready"
                        value={option.value.toString()}
                        checked={formData.commitment_ready === option.value}
                        onChange={() => updateFormData('commitment_ready', option.value)}
                        className="w-4 h-4 text-emerald-500 bg-transparent border-white/40 focus:ring-emerald-500 focus:ring-2"
                      />
                      <span className="text-white/80">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.commitment_ready && <p className="text-red-400 text-sm mt-1">{errors.commitment_ready}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Why do you want to work with {creator.display_name} specifically? *</label>
                <textarea
                  value={formData.why_this_coach}
                  onChange={(e) => updateFormData('why_this_coach', e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none ${errors.why_this_coach ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="What drew you to this coach? What do you hope to gain from working together?"
                />
                {errors.why_this_coach && <p className="text-red-400 text-sm mt-1">{errors.why_this_coach}</p>}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Optional: Upload a photo</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">This can help your coach understand your starting point</p>
                  <p className="text-white/40 text-xs mt-1">Upload coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-4 py-6 border-t border-white/10 bg-black/20">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}