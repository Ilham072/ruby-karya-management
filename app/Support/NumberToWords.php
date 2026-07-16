<?php

namespace App\Support;

class NumberToWords
{
    public static function rupiah(
        int|float|string $number
    ): string {
        $result = trim(
            self::spell((int) floor((float) $number))
        );

        return ucfirst($result).' rupiah';
    }

    private static function spell(int $number): string
    {
        $words = [
            '',
            'satu',
            'dua',
            'tiga',
            'empat',
            'lima',
            'enam',
            'tujuh',
            'delapan',
            'sembilan',
            'sepuluh',
            'sebelas',
        ];

        if ($number < 12) {
            return $words[$number];
        }

        if ($number < 20) {
            return self::spell($number - 10).' belas';
        }

        if ($number < 100) {
            return trim(
                self::spell(intdiv($number, 10))
                .' puluh '
                .self::spell($number % 10)
            );
        }

        if ($number < 200) {
            return trim(
                'seratus '.self::spell($number - 100)
            );
        }

        if ($number < 1000) {
            return trim(
                self::spell(intdiv($number, 100))
                .' ratus '
                .self::spell($number % 100)
            );
        }

        if ($number < 2000) {
            return trim(
                'seribu '.self::spell($number - 1000)
            );
        }

        if ($number < 1_000_000) {
            return trim(
                self::spell(intdiv($number, 1000))
                .' ribu '
                .self::spell($number % 1000)
            );
        }

        if ($number < 1_000_000_000) {
            return trim(
                self::spell(intdiv($number, 1_000_000))
                .' juta '
                .self::spell($number % 1_000_000)
            );
        }

        if ($number < 1_000_000_000_000) {
            return trim(
                self::spell(intdiv($number, 1_000_000_000))
                .' miliar '
                .self::spell($number % 1_000_000_000)
            );
        }

        return trim(
            self::spell(
                intdiv($number, 1_000_000_000_000)
            )
            .' triliun '
            .self::spell(
                $number % 1_000_000_000_000
            )
        );
    }
}