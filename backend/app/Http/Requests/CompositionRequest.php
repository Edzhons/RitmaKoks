<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PATCH') || $this->isMethod('PUT');
        $required = $isUpdate ? ['sometimes', 'required'] : ['required'];

        return [
            'title' => [...$required, 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'content' => [...$required, 'array'],
            'category_ids' => ['sometimes', 'array', 'max:20'],
            'category_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('categories', 'id'),
            ],
            'user_id' => ['prohibited'],
            'published_at' => ['prohibited'],
            'deleted_at' => ['prohibited'],
            'source_rhythm_exercise_id' => ['prohibited'],
            'source_melody_composition_id' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Lūdzu, ievadi darba nosaukumu.',
            'title.string' => 'Darba nosaukumam jābūt tekstam.',
            'title.max' => 'Darba nosaukums nedrīkst pārsniegt 255 rakstzīmes.',
            'description.string' => 'Aprakstam jābūt tekstam.',
            'description.max' => 'Apraksts nedrīkst pārsniegt 5000 rakstzīmes.',
            'content.required' => 'Darbā trūkst satura.',
            'content.array' => 'Darba saturam jābūt derīgam datu objektam.',
            'category_ids.array' => 'Kategorijām jābūt norādītām kā sarakstam.',
            'category_ids.max' => 'Darbam var pievienot ne vairāk kā 20 kategorijas.',
            'category_ids.*.required' => 'Kategorijas identifikators ir obligāts.',
            'category_ids.*.integer' => 'Kategorijas identifikatoram jābūt veselam skaitlim.',
            'category_ids.*.distinct' => 'Vienu kategoriju nevar pievienot vairākas reizes.',
            'category_ids.*.exists' => 'Izvēlētā kategorija nav atrasta.',
            'user_id.prohibited' => 'Darba īpašnieku nosaka pieslēgtais lietotājs.',
            'published_at.prohibited' => 'Darba publicēšanu pārvalda atsevišķa publicēšanas darbplūsma.',
            'deleted_at.prohibited' => 'Dzēšanas statusu nevar mainīt ar darba datiem.',
            'source_rhythm_exercise_id.prohibited' => 'Darba kopijas avotu nevar mainīt šajā darbplūsmā.',
            'source_melody_composition_id.prohibited' => 'Darba kopijas avotu nevar mainīt šajā darbplūsmā.',
        ];
    }
}
