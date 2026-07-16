<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search'));
        $status = trim((string) $request->input('status'));

        $projects = Project::query()
            ->with('customer:id,name')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('project_code', 'like', "%{$search}%")
                        ->orWhere('job_type', 'like', "%{$search}%")
                        ->orWhere('contract_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when(
                in_array($status, [
                    'draft',
                    'active',
                    'completed',
                    'cancelled',
                ]),
                fn ($query) => $query->where('status', $status)
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'customers' => Customer::query()
                ->orderBy('name')
                ->get(['id', 'name']),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateProject($request);

        if (blank($validated['project_code'] ?? null)) {
            $validated['project_code'] = $this->generateProjectCode();
        }

        Project::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Proyek berhasil ditambahkan.');
    }

    public function update(
        Request $request,
        Project $project
    ): RedirectResponse {
        $validated = $this->validateProject($request, $project);

        if (blank($validated['project_code'] ?? null)) {
            $validated['project_code'] = $project->project_code
                ?: $this->generateProjectCode();
        }

        $project->update($validated);

        return back()->with('success', 'Data proyek berhasil diperbarui.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $hasInvoice = DB::table('invoices')
            ->where('project_id', $project->id)
            ->exists();

        if ($hasInvoice) {
            return back()->withErrors([
                'project' => 'Proyek tidak dapat dihapus karena sudah mempunyai invoice.',
            ]);
        }

        $project->delete();

        return back()->with('success', 'Proyek berhasil dihapus.');
    }

    private function validateProject(
        Request $request,
        ?Project $project = null
    ): array {
        return $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'project_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('projects', 'project_code')
                    ->ignore($project?->id),
            ],
            'name' => ['required', 'string', 'max:200'],
            'job_type' => ['required', 'string', 'max:150'],
            'contract_number' => ['nullable', 'string', 'max:100'],
            'contract_date' => ['nullable', 'date'],
            'start_date' => ['nullable', 'date'],
            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
            'contract_value' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'status' => [
                'required',
                Rule::in([
                    'draft',
                    'active',
                    'completed',
                    'cancelled',
                ]),
            ],
        ]);
    }

    private function generateProjectCode(): string
    {
        $nextNumber = ((int) Project::max('id')) + 1;

        return sprintf(
            'PRJ-%s-%03d',
            now()->format('Y'),
            $nextNumber
        );
    }
}