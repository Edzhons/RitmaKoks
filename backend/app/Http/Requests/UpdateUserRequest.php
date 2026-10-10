<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],
            'role' => [
                'sometimes',
                Rule::prohibitedIf(fn (): bool => ! $this->user()->isAdmin()),
                Rule::enum(UserRole::class),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Lūdzu, ievadi savu vārdu.',
            'name.max' => 'Vārds nedrīkst būt garāks par 255 rakstzīmēm.',
            'email.required' => 'Lūdzu, ievadi e-pasta adresi.',
            'email.email' => 'Lūdzu, ievadi derīgu e-pasta adresi.',
            'email.unique' => 'Konts ar šo e-pasta adresi jau ir reģistrēts.',
            'role.prohibited' => 'Lietotāja lomu var mainīt tikai administrators.',
            'role.enum' => 'Izvēlētā lietotāja loma nav derīga.',
        ];
    }
}
