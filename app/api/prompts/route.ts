import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Prompt } from '@/models/prompts';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    // Read the optional `filter` query param
    const url = new URL(request.url);
    const filterParam = url.searchParams.get('filter');

    // If no filter provided, return unfiltered prompts (no sorting)
    if (!filterParam) {
      const prompts = await Prompt.find({}).lean();
      return NextResponse.json(
        {
          success: true,
          filter: null,
          data: prompts,
          count: prompts.length
        },
        { status: 200 }
      );
    }

    const normalizedFilter = filterParam
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    // Supported filters and their behaviors
    const filterMap: Record<string, { name: string; sort?: Record<string, number>; query?: Record<string, any> }> = {
      newest_first: { name: 'newest', sort: { timestamp: -1 } },
      oldest_first: { name: 'oldest', sort: { timestamp: 1 } },
      evaluated: { name: 'evaluated', query: { evaluation: { $ne: null } } },
      not_evaluated: { name: 'not_evaluated', query: { evaluation: null } },
    };

    if (!(normalizedFilter in filterMap)) {
      return NextResponse.json(
        { success: false, error: `Filter "${filterParam}" not implemented yet. Supported: ${Object.keys(filterMap).join(', ')}` },
        { status: 400 }
      );
    }

    const filterInfo = filterMap[normalizedFilter];

    // Build query (default to empty object) and apply sorting if defined
    const query = filterInfo.query ?? {};

    console.log(query, filterInfo);

    const prompts = filterInfo.sort
      ? await Prompt.find(query).sort(filterInfo.sort).lean()
      : await Prompt.find(query).lean();

    return NextResponse.json(
      {
        success: true,
        filter: filterInfo.name,
        data: prompts,
        count: prompts.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prompts'
      },
      { status: 500 }
    );
  }
}

