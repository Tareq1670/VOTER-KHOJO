"use client";

import { Card, CardContent } from "@heroui/react";
import { Lock } from "@gravity-ui/icons";

export default function PermissionDenied({ title, description }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Card className="surface-card">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-50">
            <Lock className="size-6 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-ink-900">{title}</h1>
          <p className="max-w-md text-sm text-ink-600">{description}</p>
          <p className="text-xs text-ink-600">
            এই কাজটি করার জন্য এডমিনের অনুমতি প্রয়োজন। অনুমতি পাওয়ার পর আবার চেষ্টা
            করুন।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}