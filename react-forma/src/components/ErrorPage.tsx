import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : (error as any)?.message || 'Došlo je do greške'

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-danger">
            <div className="card-body">
              <h1 className="h4 text-danger">Greška</h1>
              <p className="mb-3">{message}</p>
              <Link to="/" className="btn btn-primary">Nazad na početnu</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


