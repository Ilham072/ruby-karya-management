<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $invoice->invoice_number }}</title>

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
            line-height: 1.45;
        }

        .top-line {
            position: fixed;
            top: -24px;
            left: -38px;
            right: -38px;
            height: 14px;
            background: #ffb800;
        }

        .header {
            width: 100%;
            margin-bottom: 22px;
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
            font-size: 28px;
            font-weight: bold;
            text-align: right;
        }

        .document-number {
            margin-top: 6px;
            font-size: 11px;
            font-weight: bold;
            text-align: right;
        }

        .document-date {
            margin-top: 5px;
            color: #777773;
            text-align: right;
        }

        .two-column {
            width: 100%;
            margin-bottom: 20px;
        }

        .two-column td {
            width: 50%;
            vertical-align: top;
        }

        .section-label {
            margin-bottom: 7px;
            color: #777773;
            font-size: 8px;
            font-weight: bold;
            letter-spacing: .8px;
            text-transform: uppercase;
        }

        .strong-value {
            margin-bottom: 4px;
            font-size: 13px;
            font-weight: bold;
        }

        .description-box {
            margin-bottom: 22px;
            border-radius: 7px;
            background: #f4f4f1;
            padding: 13px 15px;
        }

        .description-text {
            margin-top: 7px;
            font-size: 10px;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
        }

        .items-table thead {
            background: #242424;
            color: #ffffff;
        }

        .items-table th {
            padding: 11px 9px;
            font-size: 8px;
            letter-spacing: .5px;
            text-align: left;
        }

        .items-table td {
            border: 1px solid #deded8;
            padding: 11px 9px;
            vertical-align: top;
        }

        .text-right {
            text-align: right !important;
        }

        .item-title {
            font-size: 10px;
            font-weight: bold;
        }

        .item-detail {
            margin-top: 4px;
            color: #777773;
            font-size: 8px;
        }

        .summary-layout {
            width: 100%;
            margin-top: 15px;
        }

        .summary-layout td {
            vertical-align: top;
        }

        .total-box {
            width: 44%;
            border-radius: 7px;
            background: #ffb800;
            padding: 14px 16px;
        }

        .total-label {
            font-size: 8px;
            font-weight: bold;
        }

        .total-value {
            margin-top: 7px;
            font-size: 19px;
            font-weight: bold;
        }

        .summary-table {
            width: 48%;
            margin-left: auto;
            border-collapse: collapse;
        }

        .summary-table td {
            border-bottom: 1px solid #e1e1dc;
            padding: 7px 0;
        }

        .summary-table td:last-child {
            font-weight: bold;
            text-align: right;
        }

        .bottom-layout {
            width: 100%;
            margin-top: 24px;
        }

        .bottom-layout td {
            vertical-align: top;
        }

        .payment-column {
            width: 55%;
        }

        .signature-column {
            width: 45%;
            padding-left: 28px;
        }

        .spacer {
            height: 16px;
        }

        .terbilang {
            font-size: 11px;
            font-weight: bold;
        }

        .bank {
            margin-top: 7px;
            font-size: 11px;
            font-weight: bold;
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
            height: 63px;
            margin-top: 10px;
            border: 1px dashed #cfcfc9;
            border-radius: 6px;
            color: #999994;
            font-size: 7px;
            text-align: center;
        }

        .signature-placeholder {
             color: #999994;
            font-size: 7px;
            line-height: 63px;
            text-align: center;
        }

        .signature-image {
            position: relative;
            z-index: 2;
            display: block;
            max-width: 125px;
            max-height: 55px;
            margin: 4px auto 0;
        }

        .stamp-image {
            position: absolute;
            z-index: 3;
            left: -22px;
            top: 3px;
            width: 58px;
            max-height: 58px;
        }

        .stamp-placeholder {
            position: absolute;
            left: -30px;
            top: 7px;
            width: 48px;
            height: 48px;
            border: 1px dashed #ffb800;
            border-radius: 50%;
            color: #b07e00;
            font-size: 6px;
            line-height: 48px;
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

        tr,
        .description-box,
        .total-box,
        .signature-area {
            page-break-inside: avoid;
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
                <div class="document-title">INVOICE</div>

                <div class="document-number">
                    {{ $invoice->invoice_number }}
                </div>

                <div class="document-date">
                    Tanggal:
                    {{ $invoice->invoice_date->format('d/m/Y') }}
                </div>

                @if ($invoice->due_date)
                    <div class="document-date">
                        Jatuh tempo:
                        {{ $invoice->due_date->format('d/m/Y') }}
                    </div>
                @endif
            </td>
        </tr>
    </table>

    <table class="two-column">
        <tr>
            <td style="padding-right: 20px;">
                <div class="section-label">
                    Ditagihkan Kepada
                </div>

                <div class="strong-value">
                    {{ $invoice->project->customer->name }}
                </div>

                <div class="muted">
                    {{ $invoice->project->customer->address ?? '-' }}
                </div>
            </td>

            <td style="padding-left: 20px;">
                <div class="section-label">
                    Informasi Proyek
                </div>

                <div class="strong-value">
                    {{ $invoice->project->name }}
                </div>

                <div class="muted">
                    {{ $invoice->project->job_type }}

                    @if ($invoice->term_number)
                        | Termin ke-{{ $invoice->term_number }}
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <div class="description-box">
        <div class="section-label">
            Deskripsi Pekerjaan
        </div>

        <div class="description-text">
            {{ $invoice->description }}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 6%;">NO</th>
                <th style="width: 45%;">URAIAN</th>
                <th class="text-right" style="width: 10%;">QTY</th>
                <th style="width: 10%;">SATUAN</th>
                <th class="text-right" style="width: 14%;">
                    HARGA
                </th>
                <th class="text-right" style="width: 15%;">
                    JUMLAH
                </th>
            </tr>
        </thead>

        <tbody>
            @foreach ($invoice->items as $item)
                <tr>
                    <td>{{ $loop->iteration }}</td>

                    <td>
                        <div class="item-title">
                            {{ $item->description }}
                        </div>

                        @if ($item->details)
                            <div class="item-detail">
                                {{ $item->details }}
                            </div>
                        @endif
                    </td>

                    <td class="text-right">
                        {{ number_format($item->quantity, 2, ',', '.') }}
                    </td>

                    <td>{{ $item->unit ?: '-' }}</td>

                    <td class="text-right">
                        Rp{{ number_format($item->unit_price, 0, ',', '.') }}
                    </td>

                    <td class="text-right">
                        <strong>
                            Rp{{ number_format($item->amount, 0, ',', '.') }}
                        </strong>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="summary-layout">
        <tr>
            <td class="total-box">
                <div class="total-label">TOTAL TAGIHAN</div>

                <div class="total-value">
                    Rp{{ number_format($invoice->total_amount, 0, ',', '.') }}
                </div>
            </td>

            <td>
                <table class="summary-table">
                    <tr>
                        <td>Subtotal</td>
                        <td>
                            Rp{{ number_format($invoice->subtotal, 0, ',', '.') }}
                        </td>
                    </tr>

                    <tr>
                        <td>Telah dibayar</td>
                        <td>
                            Rp{{ number_format($invoice->paid_amount, 0, ',', '.') }}
                        </td>
                    </tr>

                    <tr>
                        <td>Sisa tagihan</td>
                        <td>
                            Rp{{ number_format($invoice->remaining_amount, 0, ',', '.') }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="bottom-layout">
        <tr>
            <td class="payment-column">
                <div class="section-label">Terbilang</div>

                <div class="terbilang">
                    {{ $terbilang }}
                </div>

                <div class="spacer"></div>

                <div class="section-label">Pembayaran</div>

                <div class="bank">
                    Bank {{ $company->bank_name ?? 'BRI' }}
                    |
                    {{ $company->bank_account_number ?? '' }}
                </div>

                <div class="muted">
                    a.n.
                    {{ $company->bank_account_name ?? 'CV RUBY KARYA' }}
                </div>
            </td>

            <td class="signature-column">
                <div class="signature-heading">
                    Bone,
                    {{ $invoice->invoice_date->format('d/m/Y') }}
                </div>

                <div class="signature-heading">
                    Hormat kami,
                </div>

                <div class="signature-role">
                    Direktur {{ $company->company_name ?? 'CV Ruby Karya' }}
                </div>

                <div class="signature-area">
                    @if ($signatureData)
                        <img
                            src="{{ $signatureData }}"
                            class="signature-image"
                            alt="Tanda tangan direktur"
                        >
                    @else
                        <div class="signature-placeholder">
                            AREA TANDA TANGAN
                        </div>
                    @endif

                    @if ($invoice->use_stamp ?? false)
                        @if ($stampData)
                            <img
                                src="{{ $stampData }}"
                                class="stamp-image"
                                alt="Stempel perusahaan"
                            >
                        @else
                            <div class="stamp-placeholder">
                                STEMPEL
                            </div>
                        @endif
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