import GenresView from '@/views/all-genres/genresView'
import React from 'react'

const GenrePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  return <GenresView genre={id} />
}

export default GenrePage