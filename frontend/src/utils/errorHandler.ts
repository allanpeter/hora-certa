import axios, { AxiosError } from 'axios';

/**
 * Map backend errors to user-friendly Portuguese messages
 */
export function getFriendlyErrorMessage(error: unknown): string {
  let errorMessage = '';

  // Extract the raw error message
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    errorMessage = axiosError.response?.data?.message || axiosError.message || '';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Map common errors to friendly Portuguese messages
  if (errorMessage.includes('not found') || errorMessage.includes('User with email')) {
    return 'Este usuário não existe. Peça para ele criar uma conta primeiro.';
  }
  if (errorMessage.includes('already a member')) {
    return 'Este usuário já é membro da equipe.';
  }
  if (errorMessage.includes('already registered')) {
    return 'Este email já foi registrado.';
  }
  if (errorMessage.includes('email not found') || errorMessage.includes('Invalid email')) {
    return 'Email inválido ou não encontrado.';
  }
  if (errorMessage.includes('password')) {
    return 'Senha inválida.';
  }
  if (errorMessage.includes('Cannot delete shop with staff')) {
    return 'Não é possível remover a barbearia com membros da equipe. Remova todos os membros primeiro.';
  }
  if (errorMessage.includes('shop owner can delete')) {
    return 'Apenas o proprietário da barbearia pode removê-la.';
  }
  if (errorMessage.includes('access')) {
    return 'Você não tem permissão para realizar esta ação.';
  }

  // Generic fallback
  return 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
}
