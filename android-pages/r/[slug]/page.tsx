import ReferralClient from "./client";

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export default async function ReferralRedirectPage({ params }: Props) {
  const { slug } = await params;
  
  return <ReferralClient slug={slug} />;
}
