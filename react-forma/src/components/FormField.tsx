import type { FieldError } from 'react-hook-form'
import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  id: string
  label: string
  error?: FieldError
  help?: string
}>

export function FormField({ id, label, error, help, children }: Props) {
  return (
    <div className="form-group-pro">
      <label htmlFor={id} className="form-label-pro">{label}</label>
      {children}
      <div className={classNames('form-text-pro', { 
        'error': !!error
      })}>
        {error?.message ?? help}
      </div>
    </div>
  )
}

export default FormField


