import { AUTH } from '@lib/api/auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import type {
  TrendsData,
  ErrorResponse,
  TrendsResponse,
  FilteredTrends
} from '@lib/types/place';

type PlaceIdEndpointQuery = {
  id: string;
  limit?: string;
};

const mockTrends = [
  {
    name: '#NextJS',
    url: 'https://twitter.com/search?q=%23NextJS',
    promoted_content: null,
    query: '%23NextJS',
    tweet_volume: 125430
  },
  {
    name: '#ReactJS',
    url: 'https://twitter.com/search?q=%23ReactJS',
    promoted_content: null,
    query: '%23ReactJS',
    tweet_volume: 84320
  },
  {
    name: '#TailwindCSS',
    url: 'https://twitter.com/search?q=%23TailwindCSS',
    promoted_content: null,
    query: '%23TailwindCSS',
    tweet_volume: 51200
  },
  {
    name: '#Firebase',
    url: 'https://twitter.com/search?q=%23Firebase',
    promoted_content: null,
    query: '%23Firebase',
    tweet_volume: 34100
  },
  {
    name: 'TypeScript',
    url: 'https://twitter.com/search?q=TypeScript',
    promoted_content: null,
    query: 'TypeScript',
    tweet_volume: 98400
  },
  {
    name: 'Elon Musk',
    url: 'https://twitter.com/search?q=Elon%20Musk',
    promoted_content: null,
    query: 'Elon%20Musk',
    tweet_volume: 450000
  },
  {
    name: 'OpenAI',
    url: 'https://twitter.com/search?q=OpenAI',
    promoted_content: null,
    query: 'OpenAI',
    tweet_volume: 231500
  },
  {
    name: 'JavaScript',
    url: 'https://twitter.com/search?q=JavaScript',
    promoted_content: null,
    query: 'JavaScript',
    tweet_volume: 154000
  },
  {
    name: 'WebDev',
    url: 'https://twitter.com/search?q=WebDev',
    promoted_content: null,
    query: 'WebDev',
    tweet_volume: 78900
  },
  {
    name: '#Vercel',
    url: 'https://twitter.com/search?q=%23Vercel',
    promoted_content: null,
    query: '%23Vercel',
    tweet_volume: 12400
  }
];

export default async function placeIdEndpoint(
  req: NextApiRequest,
  res: NextApiResponse<TrendsResponse | ErrorResponse>
): Promise<void> {
  const { id, limit } = req.query as PlaceIdEndpointQuery;

  if (
    !process.env.TWITTER_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN === 'YOUR_TWITTER_BEARER_TOKEN'
  ) {
    const limitParam = limit ? parseInt(limit, 10) : null;
    let formattedTrends = mockTrends;

    formattedTrends = formattedTrends
      .map(({ url, ...rest }) => ({
        ...rest,
        url: url.replace(/http.*.com/, '')
      }))
      .sort((a, b) => b.tweet_volume - a.tweet_volume);

    if (limitParam) formattedTrends = formattedTrends.slice(0, limitParam);

    res.status(200).json({
      trends: formattedTrends,
      location: 'Worldwide'
    });
    return;
  }

  const response = await fetch(
    `https://api.twitter.com/1.1/trends/place.json?id=${id}`,
    AUTH
  );

  const rawData = (await response.json()) as TrendsData | ErrorResponse;

  const data =
    'errors' in rawData
      ? rawData
      : { trends: rawData[0].trends, location: rawData[0].locations[0].name };

  const limitParam = limit ? parseInt(limit, 10) : null;

  let formattedTrends = limitParam && !('errors' in data) ? data.trends : null;

  if (formattedTrends) {
    const filteredTrends = formattedTrends.filter(
      ({ tweet_volume }) => tweet_volume
    ) as FilteredTrends;

    formattedTrends = filteredTrends
      .map(({ url, ...rest }) => ({
        ...rest,
        url: url.replace(/http.*.com/, '')
      }))
      .sort((a, b) => b.tweet_volume - a.tweet_volume);

    if (limitParam) formattedTrends = formattedTrends.slice(0, limitParam);
  }

  const formattedData = formattedTrends
    ? { ...data, trends: formattedTrends }
    : null;

  res.status(response.status).json(formattedData ?? data);
}
