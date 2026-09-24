import React from 'react';
import { Star, MessageSquareQuote, CheckCircle, ThumbsUp } from 'lucide-react';
import { REVIEWS, CAFE_INFO } from '../data/cafeData';
import { Review } from '../types';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-20 lg:py-28 bg-[#130b06] border-b border-[#29190f] relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 text-left gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c9955e] mb-3">
              <span>Ballarat Community & Guests</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-[#fcf9f5] leading-tight">
              Beloved by locals, <br />
              <span className="italic font-normal text-[#dfa467]">cherished by travelers</span>.
            </h2>
          </div>

          {/* Aggregate Rating Block */}
          <div className="p-5 rounded-2xl bg-[#1d120a] border border-[#3b2416] flex items-center gap-5">
            <div className="text-center">
              <div className="font-display text-4xl sm:text-5xl font-bold text-[#e5af75]">
                {CAFE_INFO.rating}
              </div>
              <div className="flex text-amber-400 justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <div className="h-12 w-px bg-[#362114]" />
            <div className="text-left text-xs text-[#a98f78] space-y-1">
              <div className="text-white font-medium text-sm">
                {CAFE_INFO.reviewsCount} Google Reviews
              </div>
              <div>Top-rated Cafe on Sturt St</div>
              <div className="text-[#c9955e]">Authentic Ballarat feedback</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {REVIEWS.map((review: Review) => (
            <div
              key={review.id}
              className="p-6 rounded-2xl bg-[#191009] border border-[#362215] hover:border-[#613c22] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with star rating & tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#dfa467] bg-[#29170d] px-2.5 py-0.5 rounded border border-[#482c19]">
                    {review.tag}
                  </span>
                </div>

                {/* Comment quote */}
                <p className="text-sm text-[#ceb8a3] leading-relaxed mb-6 italic font-body">
                  "{review.comment}"
                </p>
              </div>

              {/* Author and verification source */}
              <div className="pt-4 border-t border-[#29190f] flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-[#f6eee5]">{review.author}</div>
                  <div className="text-[#8e735e]">{review.source}</div>
                </div>
                <span className="text-[#7d6350]">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
