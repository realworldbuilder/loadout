import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations (no RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmZtdXJ0aW5nYmt5bGpwZHVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY0NjEzOCwiZXhwIjoyMDg4MjIyMTM4fQ.hb-dIFb0Zia4vPhTSelofdPk6pk1HSPKdwWOHiWErH4'
);

export async function POST(request: NextRequest) {
  try {
    const { codeId, action } = await request.json();

    // Validate input
    if (!codeId || !action) {
      return NextResponse.json(
        { error: 'codeId and action are required' },
        { status: 400 }
      );
    }

    if (!['copy', 'click'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "copy" or "click"' },
        { status: 400 }
      );
    }

    // Determine which column to increment
    const columnToIncrement = action === 'copy' ? 'copy_count' : 'click_count';

    // Increment the appropriate counter
    const { data, error } = await supabase
      .rpc('increment_code_count', {
        code_id: codeId,
        column_name: columnToIncrement
      });

    if (error) {
      // If the RPC function doesn't exist, fall back to a direct update
      const { data: currentCode, error: fetchError } = await supabase
        .from('creator_codes')
        .select(`${columnToIncrement}`)
        .eq('id', codeId)
        .single();

      if (fetchError) {
        console.error('Error fetching current code:', fetchError);
        return NextResponse.json(
          { error: 'Failed to track action' },
          { status: 500 }
        );
      }

      const newCount = ((currentCode as any)[columnToIncrement] || 0) + 1;
      
      const { error: updateError } = await supabase
        .from('creator_codes')
        .update({ [columnToIncrement]: newCount })
        .eq('id', codeId);

      if (updateError) {
        console.error('Error updating code count:', updateError);
        return NextResponse.json(
          { error: 'Failed to track action' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in track API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}