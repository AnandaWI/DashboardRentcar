import { AsyncPaginate } from 'react-select-async-paginate'
import axiosInstance from '../../core/axiosInstance'

const CarCategorySelect = ({ value, onChange }) => {
  const loadOptions = async (search, loadedOptions, { page }) => {
    try {
      const res = await axiosInstance.get('/api/car-types', {
        params: {
          page,
          q: search || '', // tambahkan q untuk search
        },
      })
      const data = res.data.data
      return {
        options: data.map((cat) => ({
          value: cat.id,
          label: cat.car_name,
        })),
        hasMore: data.length > 0,
        additional: { page: page + 1 },
      }
    } catch (err) {
      console.error(err)
      return {
        options: [],
        hasMore: false,
        additional: { page },
      }
    }
  }

  return (
    <AsyncPaginate
      value={value || null}
      loadOptions={loadOptions}
      onChange={onChange}
      additional={{ page: 1 }}
      placeholder="Select Car name"
    />
  )
}

export default CarCategorySelect
