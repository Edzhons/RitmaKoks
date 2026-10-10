<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompositionIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'search' => ['sometimes', 'string', 'max:100'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'sort' => ['sometimes', Rule::in(['created_at', 'updated_at', 'title'])],
            'direction' => ['sometimes', Rule::in(['asc', 'desc'])],
        ];
    }

    public function messages(): array
    {
        return [
            'page.integer' => 'Lapas numuram jābūt veselam skaitlim.',
            'page.min' => 'Lapas numuram jābūt vismaz 1.',
            'per_page.integer' => 'Vienā lapā redzamo darbu skaitam jābūt veselam skaitlim.',
            'per_page.min' => 'Vienā lapā jābūt redzamam vismaz vienam darbam.',
            'per_page.max' => 'Vienā lapā var parādīt ne vairāk kā 50 darbus.',
            'search.string' => 'Meklēšanas tekstam jābūt derīgam.',
            'search.max' => 'Meklēšanas teksts nedrīkst pārsniegt 100 rakstzīmes.',
            'category_id.integer' => 'Kategorijas identifikatoram jābūt veselam skaitlim.',
            'category_id.exists' => 'Izvēlētā kategorija nav atrasta.',
            'sort.in' => 'Izvēlētais kārtošanas lauks nav atļauts.',
            'direction.in' => 'Kārtošanas virzienam jābūt asc vai desc.',
        ];
    }
}
