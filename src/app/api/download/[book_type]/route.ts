import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'

const VALID_BOOK_TYPES = ['publishers', 'agents', 'therapists'] as const

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ book_type: string }> }
) {
  try {
    // Await params (Next.js 15 pattern)
    const { book_type } = await params

    // Validate book_type
    if (!VALID_BOOK_TYPES.includes(book_type as any)) {
      return new Response(
        JSON.stringify({ error: 'Invalid book type' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract email from query string
    const email = req.nextUrl.searchParams.get('email')
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email parameter required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client
    // IMPORTANT: This uses NEXT_PUBLIC_SUPABASE_ANON_KEY (anon role, NOT service_role).
    // All database operations go through RLS. The SELECT and INSERT policies created
    // in migration 00006 are required for these queries to succeed.
    const supabase = await createClient()

    // Verify email is verified in database
    // This query relies on the "Allow anonymous select on verified contacts" RLS policy
    const { data, error } = await supabase
      .from('contacts')
      .select('id, email_verified')
      .eq('email', email.toLowerCase().trim())
      .eq('email_verified', true)
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - email not verified' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Log the download
    // This INSERT relies on the "Allow anonymous insert on book_downloads" RLS policy
    // Log errors but don't block the download if logging fails
    const { error: logError } = await supabase
      .from('book_downloads')
      .insert({
        contact_id: data.id,
        book_type: book_type
      })

    if (logError) {
      console.error('Failed to log book download:', logError)
    }

    // Download PDF from Supabase Storage (private 'books' bucket)
    const { data: fileData, error: storageError } = await supabase
      .storage
      .from('books')
      .download(`${book_type}.pdf`)

    if (storageError || !fileData) {
      console.error('Storage download error:', storageError)
      return new Response(
        JSON.stringify({ error: 'Book file not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const arrayBuffer = await fileData.arrayBuffer()

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="continua-${book_type}-book.pdf"`,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
