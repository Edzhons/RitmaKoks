<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Lūdzu, ievadi e-pasta adresi.',
            'email.email' => 'Lūdzu, ievadi derīgu e-pasta adresi.',
            'password.required' => 'Lūdzu, ievadi paroli.',
        ];
    }
}
