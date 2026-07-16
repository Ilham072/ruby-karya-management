<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $receipt->receipt_number }}</title>

    <style>
        @page {
            margin: 24px 38px 70px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #242424;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            line-height: 1.5;
        }

        .top-line {
            position: fixed;
            top: -24px;
            right: -38px;
            left: -38px;
            height: 14px;
            background: #ffb800;
        }

        .header {
            width: 100%;
            margin-bottom: 28px;
            border-bottom: 1px solid #d8d8d3;
            padding-bottom: 18px;
        }

        .header td {
            vertical-align: top;
        }

        .logo {
            width: 68px;
        }

        .company-name {
            margin: 3px 0 5px;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .muted {
            color: #777773;
        }

        .document-title {
            margin: 0;
            font-size: 27px;
            font-weight: bold;
            text-align: right;
        }

        .document-number {
            margin-top: 7px;
            font-size: 11px;
            font-weight: bold;
            text-align: right;
        }

        .document-date {
            margin-top: 5px;
            color: #777773;
            text-align: right;
        }

        .section-label {
            margin-bottom: 7px;
            color: #777773;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: .8px;
            text-transform: uppercase;
        }

        .customer-name {
            margin-bottom: 24px;
            font-size: 16px;
            font-weight: bold;
        }

        .amount-box {
            margin-bottom: 22px;
            border-radius: 8px;
            background: #ffb800;
            padding: 18px;
        }

        .amount-label {
            font-size: 8px;
            font-weight: bold;
            letter-spacing: .6px;
            text-transform: uppercase;
        }

        .amount-value {
            margin-top: 9px;
            font-size: 27px;
            font-weight: bold;
        }

        .words {
            margin-bottom: 24px;
            font-size: 13px;
            font-weight: bold;
        }

        .purpose-box {
            margin-bottom: 24px;
            border-radius: 8px;
            background: #f4f4f1;
            padding: 15px;
        }

        .purpose {
            margin-top: 7px;
            font-size: 12px;
            font-weight: bold;
        }

        .purpose-meta {
            margin-top: 14px;
            color: #777773;
            font-size: 8px;
        }

        .details-layout {
            width: 100%;
            margin-top: 14px;
            border-top: 1px solid #d8d8d3;
            padding-top: 18px;
        }

        .details-layout td {
            vertical-align: top;
        }

        .details-column {
            width: 55%;
            padding-right: 25px;
        }

        .signature-column {
            width: 45%;
            padding-left: 25px;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
        }

        .detail-table td {
            border-bottom: 1px solid #ecece8;
            padding: 8px 0;
        }

        .detail-table td:first-child {
            color: #777773;
        }

        .detail-table td:last-child {
            font-weight: bold;
            text-align: right;
        }

        .signature-heading {
            margin-bottom: 4px;
            color: #777773;
        }

        .signature-role {
            font-weight: bold;
        }

        .signature-area {
            position: relative;
            height: 70px;
            margin-top: 11px;
            border: 1px dashed #cfcfc9;
            border-radius: 6px;
            color: #999994;
            font-size: 7px;
            line-height: 70px;
            text-align: center;
        }

        .stamp-placeholder {
            position: absolute;
            left: -30px;
            top: 10px;
            width: 50px;
            height: 50px;
            border: 1px dashed #ffb800;
            border-radius: 50%;
            color: #b07e00;
            font-size: 6px;
            line-height: 50px;
            text-align: center;
        }

        .director-name {
            margin-top: 9px;
            font-size: 10px;
            font-weight: bold;
        }

        .footer {
            position: fixed;
            right: -38px;
            bottom: -70px;
            left: -38px;
            height: 48px;
            background: #242424;
            color: #ffffff;
        }

        .footer-table {
            width: 100%;
            height: 48px;
            border-collapse: collapse;
        }

        .footer-table td {
            vertical-align: middle;
            padding: 0 16px;
            font-size: 7px;
            font-weight: bold;
        }

        .footer-label {
            color: #ffb800;
            font-size: 6px;
        }

        .website-cell {
            width: 28%;
            background: #ffb800;
            color: #242424;
            font-size: 10px !important;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="top-line"></div>

    <table class="header">
        <tr>
            <td style="width: 12%;">
                @if ($logoData)
                    <img
                        src="{{ $logoData }}"
                        class="logo"
                        alt="Logo Ruby Karya"
                    >
                @endif
            </td>

            <td style="width: 53%;">
                <div class="company-name">
                    {{ $company->company_name ?? 'CV RUBY KARYA' }}
                </div>

                <div class="muted">
                    {{ $company->address ?? '' }}
                </div>
            </td>

            <td style="width: 35%;">
                <div class="document-title">KWITANSI</div>

                <div class="document-number">
                    {{ $receipt->receipt_number }}
                </div>

                <div class="document-date">
                    Tanggal diterima:
                    {{ $receipt->receipt_date->format('d/m/Y') }}
                </div>
            </td>
        </tr>
    </table>

    <div class="section-label">
        Telah Diterima Dari
    </div>

    <div class="customer-name">
        {{ $receipt->payment->invoice->project->customer->name }}
    </div>

    <div class="amount-box">
        <div class="amount-label">Uang Sejumlah</div>

        <div class="amount-value">
            Rp{{ number_format($receipt->amount, 0, ',', '.') }}
        </div>
    </div>

    <div class="section-label">Terbilang</div>

    <div class="words">
        {{ $terbilang }}
    </div>

    <div class="purpose-box">
        <div class="section-label">
            Untuk Pembayaran
        </div>

        <div class="purpose">
            Pembayaran Invoice
            {{ $receipt->payment->invoice->invoice_number }}
            atas pekerjaan
            {{ $receipt->payment->invoice->project->name }}.
        </div>

        <div class="purpose-meta">
            Metode:
            {{ ucfirst($receipt->payment->payment_method) }}

            @if ($receipt->payment->bank_name)
                | Bank:
                {{ $receipt->payment->bank_name }}
            @endif

            @if ($receipt->payment->reference_number)
                | Referensi:
                {{ $receipt->payment->reference_number }}
            @endif
        </div>
    </div>

    <table class="details-layout">
        <tr>
            <td class="details-column">
                <table class="detail-table">
                    <tr>
                        <td>Nomor Invoice</td>
                        <td>
                            {{ $receipt->payment->invoice->invoice_number }}
                        </td>
                    </tr>

                    <tr>
                        <td>Nilai Invoice</td>
                        <td>
                            Rp{{ number_format($receipt->payment->invoice->total_amount, 0, ',', '.') }}
                        </td>
                    </tr>

                    <tr>
                        <td>Pembayaran Ini</td>
                        <td>
                            Rp{{ number_format($receipt->amount, 0, ',', '.') }}
                        </td>
                    </tr>

                    <tr>
                        <td>Sisa Invoice</td>
                        <td>
                            Rp{{ number_format($receipt->payment->invoice->remaining_amount, 0, ',', '.') }}
                        </td>
                    </tr>
                </table>
            </td>

            <td class="signature-column">
                <div class="signature-heading">
                    Bone,
                    {{ $receipt->receipt_date->format('d/m/Y') }}
                </div>

                <div class="signature-heading">
                    Hormat kami,
                </div>

                <div class="signature-role">
                    Direktur {{ $company->company_name ?? 'CV Ruby Karya' }}
                </div>

                <div class="signature-area">
                    AREA TANDA TANGAN

                    @if ($receipt->use_stamp)
                        <div class="stamp-placeholder">
                            STEMPEL
                        </div>
                    @endif
                </div>

                <div class="director-name">
                    {{ $company->director_name ?? 'S. ADYANTO, SE' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="footer">
        <table class="footer-table">
            <tr>
                <td>
                    <span class="footer-label">INSTAGRAM</span><br>
                    {{ '@'.($company->instagram ?? 'therubyart_official') }}
                </td>

                <td>
                    <span class="footer-label">WHATSAPP</span><br>
                    {{ $company->phone ?? '' }}
                </td>

                <td>
                    <span class="footer-label">EMAIL</span><br>
                    {{ $company->email ?? '' }}
                </td>

                <td class="website-cell">
                    {{ $company->website ?? 'www.therubyart.com' }}
                </td>
            </tr>
        </table>
    </div>
</body>
</html>