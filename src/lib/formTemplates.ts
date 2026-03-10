export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkboxes' | 'radio' | 'photo_upload';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface FormTemplate {
  name: string;
  description: string;
  introText: string;
  confirmationText: string;
  fields: FormField[];
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    name: '1:1 Coaching',
    description: 'comprehensive personal training application',
    introText: 'ready to transform your body and mind? apply for 1:1 coaching below.',
    confirmationText: 'application submitted. sit tight.',
    fields: [
      {
        id: generateId(),
        type: 'text',
        label: 'name',
        placeholder: 'your full name',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'email',
        placeholder: 'your@email.com',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'instagram handle',
        placeholder: '@yourhandle',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'age',
        placeholder: '25',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'city',
        placeholder: 'los angeles, ca',
        required: true,
      },
      {
        id: generateId(),
        type: 'textarea',
        label: "what's your main goal?",
        placeholder: 'lose 20lbs, build muscle, etc.',
        required: true,
      },
      {
        id: generateId(),
        type: 'textarea',
        label: "what's been holding you back?",
        placeholder: 'lack of time, no plan, etc.',
        required: true,
      },
      {
        id: generateId(),
        type: 'dropdown',
        label: 'training experience',
        required: true,
        options: ['less than 6 months', '6-12 months', '1-2 years', '2+ years'],
      },
      {
        id: generateId(),
        type: 'dropdown',
        label: 'how many days can you train?',
        required: true,
        options: ['2', '3', '4', '5', '6'],
      },
      {
        id: generateId(),
        type: 'radio',
        label: 'gym type',
        required: true,
        options: ['commercial gym', 'home gym', 'both'],
      },
      {
        id: generateId(),
        type: 'radio',
        label: 'have you tracked macros before?',
        required: true,
        options: ['yes', 'no', 'on and off'],
      },
      {
        id: generateId(),
        type: 'textarea',
        label: 'anything else I should know?',
        placeholder: 'injuries, medications, etc.',
        required: false,
      },
    ],
  },
  {
    name: 'Nutrition Coaching',
    description: 'focused on diet and nutrition habits',
    introText: 'ready to dial in your nutrition? apply for nutrition coaching below.',
    confirmationText: 'application submitted. sit tight.',
    fields: [
      {
        id: generateId(),
        type: 'text',
        label: 'name',
        placeholder: 'your full name',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'email',
        placeholder: 'your@email.com',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'instagram handle',
        placeholder: '@yourhandle',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'age',
        placeholder: '25',
        required: true,
      },
      {
        id: generateId(),
        type: 'textarea',
        label: "what's your nutrition goal?",
        placeholder: 'lose weight, gain muscle, improve energy, etc.',
        required: true,
      },
      {
        id: generateId(),
        type: 'textarea',
        label: 'describe your current diet',
        placeholder: 'what does a typical day of eating look like?',
        required: true,
      },
      {
        id: generateId(),
        type: 'textarea',
        label: 'any food allergies or restrictions?',
        placeholder: 'allergies, intolerances, dietary preferences',
        required: false,
      },
      {
        id: generateId(),
        type: 'radio',
        label: 'have you tracked macros/calories before?',
        required: true,
        options: ['yes', 'no', 'tried it'],
      },
      {
        id: generateId(),
        type: 'radio',
        label: 'do you meal prep?',
        required: true,
        options: ['yes', 'sometimes', 'no'],
      },
      {
        id: generateId(),
        type: 'dropdown',
        label: 'how many meals do you eat per day?',
        required: true,
        options: ['2', '3', '4', '5+'],
      },
      {
        id: generateId(),
        type: 'textarea',
        label: 'anything else?',
        placeholder: 'additional info about your lifestyle, schedule, etc.',
        required: false,
      },
    ],
  },
  {
    name: 'Online Training',
    description: 'remote training program application',
    introText: 'ready to level up your training? apply for online coaching below.',
    confirmationText: 'application submitted. sit tight.',
    fields: [
      {
        id: generateId(),
        type: 'text',
        label: 'name',
        placeholder: 'your full name',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'email',
        placeholder: 'your@email.com',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'instagram handle',
        placeholder: '@yourhandle',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'age',
        placeholder: '25',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'city',
        placeholder: 'los angeles, ca',
        required: true,
      },
      {
        id: generateId(),
        type: 'textarea',
        label: 'what are you training for?',
        placeholder: 'strength, sports, general fitness, etc.',
        required: true,
      },
      {
        id: generateId(),
        type: 'dropdown',
        label: 'current experience level',
        required: true,
        options: ['beginner', 'intermediate', 'advanced'],
      },
      {
        id: generateId(),
        type: 'checkboxes',
        label: 'preferred training days',
        required: true,
        options: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      },
      {
        id: generateId(),
        type: 'radio',
        label: 'gym type',
        required: true,
        options: ['commercial gym', 'home gym'],
      },
      {
        id: generateId(),
        type: 'textarea',
        label: 'if home gym, list your equipment',
        placeholder: 'dumbbells, barbell, etc.',
        required: false,
      },
      {
        id: generateId(),
        type: 'textarea',
        label: 'any injuries or limitations?',
        placeholder: 'past injuries, physical limitations, etc.',
        required: false,
      },
      {
        id: generateId(),
        type: 'textarea',
        label: 'anything else?',
        placeholder: 'additional info I should know',
        required: false,
      },
    ],
  },
  {
    name: 'Blank',
    description: 'start from scratch with basic fields',
    introText: 'interested in working together? fill out the form below.',
    confirmationText: 'application submitted. sit tight.',
    fields: [
      {
        id: generateId(),
        type: 'text',
        label: 'name',
        placeholder: 'your full name',
        required: true,
      },
      {
        id: generateId(),
        type: 'text',
        label: 'email',
        placeholder: 'your@email.com',
        required: true,
      },
    ],
  },
];