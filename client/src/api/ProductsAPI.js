import { useState, useEffect } from 'react'
import axios from 'axios'

function ProductsAPI() {
    const [products, setProducts] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [callback, setCallback] = useState(false)
    const [category, setCategory] = useState('')
    const [sort, setSort] = useState('')
    const [search, setSearch] = useState('')
    const [result, setResult] = useState(0)
    const [productsAvailble, setProductsAvailable] = useState([])
    const [recommended, setRecommended] = useState([])
    const [bestSeller, setBestSeller] = useState([])
    const [newArrival, setNewArrival] = useState([])
    const [searchItem, setSearchItem] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingItem, setLoadingItem] = useState(false)
    const [tprice, setTprice] = useState(5000)
    const [fprice, setFprice] = useState(0)
    const [sizes, setSizes] = useState('')
    const [loadingType, setLoadingType] = useState({
        recommend: false,
        bestseller: false,
        newarrival: false
    })

    useEffect(() => {
        const getProducts = async () => {
            const res = await axios.get(`/api/products?${category}&${sort}&sizes=${sizes}&title[regex]=${search}&price[gte]=${fprice}&price[lte]=${tprice}`)
            setProducts(res.data.products)
            setResult(res.data.result)
        }
        getProducts()

        const getProductsAvailable = async () => {
            setLoading(true)
            const res = await axios.get(`/api/products?${category}&${sort}&sizes=${sizes}&title[regex]=${search}&price[gte]=${fprice}&price[lte]=${tprice}`)
            setProductsAvailable(res.data.products.filter(product => product.isPublished === true))
            setLoading(false)
        }
        getProductsAvailable()

        const getRecommended = async () => {
            setLoadingType({...loadingType, recommend: true})
            const res = await axios.get('/api/productsHomepage?limit=8&sort=-rating')
            setRecommended(res.data.products)
            setLoadingType({...loadingType, recommend: false})
        }

        getRecommended()

        const getBestSeller = async () => {
            setLoadingType({...loadingType, bestseller: true})
            const res = await axios.get('/api/productsHomepage?limit=8&sort=-sold')
            setBestSeller(res.data.products)
            setLoadingType({...loadingType, bestseller: false})
        }

        getBestSeller()

        const getNewArrival = async () => {
            setLoadingType({...loadingType, newarrival: true})
            const res = await axios.get('/api/productsHomepage?limit=8')
            setNewArrival(res.data.products)
            setLoadingType({...loadingType, newarrival: false})
        }

        getNewArrival()

        const getFilterProducts = async () => {
            setLoadingItem(true)
            const res = await axios.get(`/api/products`)
            setAllProducts(res.data.products)
            setSuggestions(res.data.products.filter(product => product.isPublished === true))
            setLoadingItem(false)
        }
        getFilterProducts()

    }, [callback, category, sort, search, tprice, fprice, sizes])



    return {
        products: [products, setProducts],
        allProducts: [allProducts, setAllProducts],
        callback: [callback, setCallback],
        category: [category, setCategory],
        sort: [sort, setSort],
        search: [search, setSearch],
        loadingType: [loadingType, setLoadingType],
        result: [result, setResult],
        productsAvailable: [productsAvailble, setProductsAvailable],
        recommended: [recommended, setRecommended],
        bestSeller: [bestSeller, setBestSeller],
        newArrival: [newArrival, setNewArrival],
        searchItem: [searchItem, setSearchItem],
        suggestions: [suggestions, setSuggestions],
        loading: [loading, setLoading],
        loadingItem: [loadingItem, setLoadingItem],
        fprice: [fprice, setFprice],
        tprice: [tprice, setTprice],
        sizes: [sizes, setSizes]
    }
}

export default ProductsAPI