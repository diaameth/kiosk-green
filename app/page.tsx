"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Bell,
  Settings,
  QrCode,
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  LogOut,
  ChevronRight,
  X,
  Menu,
  Wallet,
  TrendingUp,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react"

type Screen =
  | "welcome"
  | "login"
  | "otp"
  | "dashboard"
  | "transaction"
  | "supply"
  | "activity"
  | "notifications"
  | "settings"
  | "change-password"
  | "two-factor-auth"

export default function OrangeMoneyKiosque() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""])
  const [transactionType, setTransactionType] = useState<"deposit" | "withdrawal">("deposit")
  const [supplyType, setSupplyType] = useState<"uv" | "cash">("uv")
  const [amount, setAmount] = useState("")
  const [supplyAmount, setSupplyAmount] = useState([50000])
  const [showFAB, setShowFAB] = useState(false)
  const [showFABMenu, setShowFABMenu] = useState(false)
  const [otpTimer, setOtpTimer] = useState(60)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [loginError, setLoginError] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  useEffect(() => {
    if (currentScreen === "dashboard") {
      setShowFAB(true)
    } else {
      setShowFAB(false)
      setShowFABMenu(false)
    }
  }, [currentScreen])

  useEffect(() => {
    if (currentScreen === "otp" && otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen, otpTimer])

  const handleLogin = () => {
    setLoginError("")

    // Basic validation
    if (!phoneNumber || phoneNumber.replace(/\s/g, "").length !== 10) {
      setLoginError("Veuillez saisir un numéro de téléphone de 10 chiffres")
      return
    }

    if (!password || password.length < 1) {
      setLoginError("Veuillez saisir votre mot de passe")
      return
    }

    // Accept any 10-digit phone number and any password
    setCurrentScreen("otp")
    setOtpTimer(60)
    setOtpCode(["", "", "", "", "", ""])
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otpCode]
      newOtp[index] = value
      setOtpCode(newOtp)

      // Auto-move to next field when digit is entered
      if (value && index < 5) {
        const nextIndex = index + 1
        setFocusedIndex(nextIndex)
        setTimeout(() => {
          const nextInput = document.getElementById(`otp-${nextIndex}`)
          nextInput?.focus()
        }, 10)
      }
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace navigation
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevIndex = index - 1
      setFocusedIndex(prevIndex)
      setTimeout(() => {
        const prevInput = document.getElementById(`otp-${prevIndex}`)
        prevInput?.focus()
      }, 10)
    }
    // Handle paste operation
    if (e.key === "Backspace" && otpCode[index]) {
      const newOtp = [...otpCode]
      newOtp[index] = ""
      setOtpCode(newOtp)
    }
    // Prevent non-numeric input
    if (!/[0-9]/.test(e.key) && !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6)
    if (pastedData.length > 0) {
      const newOtp = [...otpCode]
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newOtp[i] = pastedData[i] || ""
      }
      setOtpCode(newOtp)
      // Focus on the next empty field or last field
      const nextEmptyIndex = newOtp.findIndex((digit) => !digit)
      const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5)
      setFocusedIndex(focusIndex)
      setTimeout(() => {
        const targetInput = document.getElementById(`otp-${focusIndex}`)
        targetInput?.focus()
      }, 10)
    }
  }

  const handleOtpFocus = (index: number) => {
    setFocusedIndex(index)
  }

  const handleOtpBlur = () => {
    // Small delay to prevent losing focus during rapid interactions
    setTimeout(() => {
      const activeElement = document.activeElement
      const isOtpInput = activeElement && activeElement.id && activeElement.id.startsWith("otp-")
      if (!isOtpInput) {
        setFocusedIndex(null)
      }
    }, 50)
  }

  const handleOtpVerification = () => {
    // Accept any complete 6-digit code
    const enteredCode = otpCode.join("")
    if (enteredCode.length === 6) {
      setCurrentScreen("dashboard")
    }
  }

  // Restore focus after re-render
  useEffect(() => {
    if (focusedIndex !== null && currentScreen === "otp") {
      const timer = setTimeout(() => {
        const input = document.getElementById(`otp-${focusedIndex}`)
        if (input) {
          input.focus()
        }
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [otpTimer, focusedIndex, currentScreen])

  // Auto-focus first empty field when screen loads
  useEffect(() => {
    if (currentScreen === "otp") {
      const firstEmptyIndex = otpCode.findIndex((digit) => !digit)
      const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex
      setTimeout(() => {
        const input = document.getElementById(`otp-${targetIndex}`)
        if (input) {
          input.focus()
          setFocusedIndex(targetIndex)
        }
      }, 100)
    }
  }, [currentScreen])

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-between h-full bg-zinc-50 p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-teal-600 rounded-2xl flex items-center justify-center mb-8">
          <Wallet className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 text-center">SMK Pay Kiosque</h1>
        <p className="text-gray-600 text-center text-base leading-relaxed">
          Gérez vos transactions clients en toute simplicité
        </p>
      </div>

      <Button
        onClick={() => setCurrentScreen("login")}
        className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl mt-3"
      >
        Démarrer
      </Button>
    </div>
  )

  const LoginScreen = () => (
    <div className="flex flex-col h-full bg-zinc-50 p-6">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connexion</h2>
          <p className="text-gray-600">Connectez-vous à votre compte agent</p>
        </div>

        <div className="space-y-6">
          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
            <Input
              type="tel"
              placeholder="77 123 45 67"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                setLoginError("")
              }}
              onKeyDown={(e) => {
                // Allow only numbers, spaces, hyphens, plus, and parentheses
                if (
                  !/[0-9\s\-+$$$$]/.test(e.key) &&
                  !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key)
                ) {
                  e.preventDefault()
                }
                // Submit on Enter
                if (e.key === "Enter") {
                  handleLogin()
                }
              }}
              autoFocus
              autoComplete="tel"
              className="h-12 text-base rounded-xl border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
            {phoneNumber && phoneNumber.replace(/\s/g, "").length !== 10 && (
              <p className="text-sm text-red-500 mt-1">Le numéro doit contenir exactement 10 chiffres</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setLoginError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin()
                  }
                }}
                autoComplete="current-password"
                className="h-12 text-base rounded-xl border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!phoneNumber || phoneNumber.replace(/\s/g, "").length !== 10 || !password}
          >
            Se connecter
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Button variant="ghost" className="text-teal-600 text-sm">
              Mot de passe oublié ?
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const OTPScreen = () => {
    return (
      <div className="flex flex-col h-full bg-zinc-50 p-6">
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentification 2FA</h2>
            <p className="text-gray-600">Saisissez le code de vérification envoyé à votre téléphone</p>
            <p className="text-sm text-gray-500 mt-1">{phoneNumber}</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center space-x-3">
              {otpCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  onFocus={() => handleOtpFocus(index)}
                  onBlur={handleOtpBlur}
                  className="w-12 h-12 text-center text-lg font-semibold rounded-xl border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 caret-teal-600"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <div className="text-center">
              {otpTimer > 0 ? (
                <p className="text-gray-500">Renvoyer le code dans {otpTimer}s</p>
              ) : (
                <Button variant="ghost" className="text-teal-600" onClick={() => setOtpTimer(60)}>
                  Renvoyer le code
                </Button>
              )}
            </div>

            <Button
              onClick={handleOtpVerification}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl"
              disabled={otpCode.some((digit) => !digit)}
            >
              Vérifier le code
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <Button
                variant="ghost"
                className="text-gray-500 text-sm"
                onClick={() => {
                  setCurrentScreen("login")
                  setOtpCode(["", "", "", "", "", ""])
                }}
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const DashboardScreen = () => (
    <div className="flex flex-col h-full bg-zinc-50">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Tableau de bord</h2>
            <p className="text-gray-600">Agent: Amadou Diallo</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("notifications")} className="relative">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {/* Soldes */}
        <Card className="shadow-sm border-0 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Soldes disponibles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Unités de valeur</p>
                <p className="text-xl font-semibold text-teal-600">2,450,000</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Cash</p>
                <p className="text-xl font-semibold text-teal-600">850,000 F</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerte seuil */}
        <Card className="shadow-sm border-0 rounded-2xl border-l-4 border-l-yellow-400">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-900">Seuil d'approvisionnement</p>
                <p className="text-sm text-gray-600">Cash en dessous de 1M F</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dernières transactions */}
        <Card className="shadow-sm border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Dernières transactions</h3>
              <Button variant="ghost" size="sm" onClick={() => setCurrentScreen("activity")}>
                Voir tout
              </Button>
            </div>
            <div className="space-y-3">
              {[
                { type: "deposit", amount: "25,000 F", phone: "77 123 45 67", time: "Il y a 5 min" },
                { type: "withdrawal", amount: "50,000 F", phone: "76 987 65 43", time: "Il y a 12 min" },
                { type: "deposit", amount: "15,000 F", phone: "78 456 78 90", time: "Il y a 25 min" },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.type === "deposit" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {transaction.type === "deposit" ? (
                        <ArrowDownLeft className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.amount}</p>
                      <p className="text-sm text-gray-600">{transaction.phone}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{transaction.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const TransactionScreen = () => (
    <div className="flex flex-col h-full bg-zinc-50">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("dashboard")}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">Transaction</h2>
          <div></div>
        </div>

        {/* Toggle Dépôt/Retrait */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <Button
            variant={transactionType === "deposit" ? "default" : "ghost"}
            className={`flex-1 h-10 rounded-lg ${
              transactionType === "deposit" ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setTransactionType("deposit")}
          >
            Dépôt
          </Button>
          <Button
            variant={transactionType === "withdrawal" ? "default" : "ghost"}
            className={`flex-1 h-10 rounded-lg ${
              transactionType === "withdrawal" ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setTransactionType("withdrawal")}
          >
            Retrait
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Numéro client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Numéro client</label>
          <div className="flex space-x-2">
            <Input type="tel" placeholder="77 123 45 67" className="flex-1 h-12 text-base rounded-xl border-gray-200" />
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-gray-200 bg-transparent">
              <QrCode className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 text-base rounded-xl border-gray-200"
          />
        </div>

        {/* Résumé */}
        {amount && (
          <Card className="shadow-sm border-0 rounded-2xl bg-teal-50 border-teal-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Résumé</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{transactionType === "deposit" ? "Dépôt" : "Retrait"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-medium">{amount} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission:</span>
                  <span className="font-medium">500 F</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{Number.parseInt(amount) + 500} F</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-6">
        <Button
          className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl"
          disabled={!amount}
        >
          Confirmer la transaction
        </Button>
      </div>
    </div>
  )

  const SupplyScreen = () => (
    <div className="flex flex-col h-full bg-zinc-50">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("dashboard")}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">Approvisionnement</h2>
          <div></div>
        </div>

        {/* Toggle UV/Cash */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <Button
            variant={supplyType === "uv" ? "default" : "ghost"}
            className={`flex-1 h-10 rounded-lg ${
              supplyType === "uv" ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setSupplyType("uv")}
          >
            Unités de valeur
          </Button>
          <Button
            variant={supplyType === "cash" ? "default" : "ghost"}
            className={`flex-1 h-10 rounded-lg ${
              supplyType === "cash" ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setSupplyType("cash")}
          >
            Cash
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Stock actuel */}
        <Card className="shadow-sm border-0 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Stock actuel</h3>
            <div className="text-center">
              <p className="text-2xl font-semibold text-teal-600">{supplyType === "uv" ? "2,450,000" : "850,000 F"}</p>
              <p className="text-sm text-gray-600">{supplyType === "uv" ? "Unités de valeur" : "Cash disponible"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Montant à demander */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Montant à demander: {supplyAmount[0].toLocaleString()} {supplyType === "cash" ? "F" : ""}
          </label>
          <Slider
            value={supplyAmount}
            onValueChange={setSupplyAmount}
            max={supplyType === "uv" ? 5000000 : 2000000}
            min={supplyType === "uv" ? 100000 : 50000}
            step={supplyType === "uv" ? 50000 : 25000}
            className="mb-4"
          />
          <Input
            type="number"
            value={supplyAmount[0]}
            onChange={(e) => setSupplyAmount([Number.parseInt(e.target.value) || 0])}
            className="h-12 text-base rounded-xl border-gray-200"
          />
        </div>

        {/* Justification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Justification (optionnel)</label>
          <textarea
            placeholder="Motif de la demande..."
            className="w-full h-20 p-3 text-base rounded-xl border border-gray-200 resize-none"
          />
        </div>
      </div>

      <div className="p-6">
        <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl">
          Envoyer la demande
        </Button>
      </div>
    </div>
  )

  const ActivityScreen = () => (
    <div className="flex flex-col h-full bg-zinc-50">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("dashboard")}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">Activité</h2>
          <Button variant="ghost" size="icon">
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {[
            {
              type: "deposit",
              amount: "25,000 F",
              phone: "77 123 45 67",
              time: "Aujourd'hui 14:30",
              status: "success",
            },
            {
              type: "withdrawal",
              amount: "50,000 F",
              phone: "76 987 65 43",
              time: "Aujourd'hui 14:15",
              status: "success",
            },
            {
              type: "supply",
              amount: "500,000 F",
              phone: "Approvisionnement",
              time: "Aujourd'hui 12:00",
              status: "pending",
            },
            {
              type: "deposit",
              amount: "15,000 F",
              phone: "78 456 78 90",
              time: "Aujourd'hui 11:45",
              status: "success",
            },
            { type: "withdrawal", amount: "75,000 F", phone: "77 555 44 33", time: "Hier 16:20", status: "success" },
            { type: "deposit", amount: "30,000 F", phone: "76 111 22 33", time: "Hier 15:10", status: "failed" },
          ].map((transaction, index) => (
            <Card key={index} className="shadow-sm border-0 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === "deposit"
                          ? "bg-green-100"
                          : transaction.type === "withdrawal"
                            ? "bg-red-100"
                            : "bg-blue-100"
                      }`}
                    >
                      {transaction.type === "deposit" ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : transaction.type === "withdrawal" ? (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      ) : (
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.amount}</p>
                      <p className="text-sm text-gray-600">{transaction.phone}</p>
                      <p className="text-xs text-gray-500">{transaction.time}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      transaction.status === "success"
                        ? "default"
                        : transaction.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                    className={
                      transaction.status === "success"
                        ? "bg-green-100 text-green-800"
                        : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                    }
                  >
                    {transaction.status === "success"
                      ? "Réussie"
                      : transaction.status === "pending"
                        ? "En cours"
                        : "Échouée"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const NotificationsScreen = () => (
    <div className="flex flex-col h-full bg-zinc-50">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("dashboard")}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          <Button variant="ghost" size="sm" className="text-teal-600">
            Tout lire
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-3">
          {[
            {
              title: "Approvisionnement approuvé",
              message: "Votre demande de 500,000 F a été approuvée",
              time: "Il y a 2h",
              unread: true,
              type: "success",
            },
            {
              title: "Seuil d'alerte atteint",
              message: "Votre stock cash est en dessous du seuil",
              time: "Il y a 4h",
              unread: true,
              type: "warning",
            },
            {
              title: "Transaction échouée",
              message: "Retrait de 75,000 F - Client insuffisant",
              time: "Hier",
              unread: false,
              type: "error",
            },
            {
              title: "Nouveau message",
              message: "Mise à jour des tarifs de commission",
              time: "Hier",
              unread: false,
              type: "info",
            },
          ].map((notification, index) => (
            <Card
              key={index}
              className={`shadow-sm border-0 rounded-2xl ${
                notification.unread ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                        notification.type === "success"
                          ? "bg-green-100"
                          : notification.type === "warning"
                            ? "bg-yellow-100"
                            : notification.type === "error"
                              ? "bg-red-100"
                              : "bg-blue-100"
                      }`}
                    >
                      {notification.type === "success" ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : notification.type === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      ) : notification.type === "error" ? (
                        <X className="w-4 h-4 text-red-600" />
                      ) : (
                        <Bell className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{notification.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                  {notification.unread && <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const SettingsScreen = () => (
    <div className="flex flex-col h-full bg-zinc-50">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("dashboard")}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">Paramètres</h2>
          <div></div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Profil */}
        <Card className="shadow-sm border-0 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback className="bg-teal-100 text-teal-600 text-lg font-semibold">AD</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">Amadou Diallo</h3>
                <p className="text-gray-600">Agent SMK PAY</p>
                <p className="text-sm text-gray-500">+221 77 123 45 67</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="shadow-sm border-0 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Sécurité
            </h3>
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-between h-12 px-0"
                onClick={() => setCurrentScreen("change-password")}
              >
                <span>Changer le mot de passe</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between h-12 px-0"
                onClick={() => setCurrentScreen("two-factor-auth")}
              >
                <div className="flex items-center justify-between w-full">
                  <span>Authentification à deux facteurs</span>
                  <div className="flex items-center space-x-2">
                    {twoFactorEnabled && <Badge className="bg-green-100 text-green-800 text-xs">Activée</Badge>}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card className="shadow-sm border-0 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Préférences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notifications push</p>
                  <p className="text-sm text-gray-600">Recevoir les alertes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notifications SMS</p>
                  <p className="text-sm text-gray-600">Alertes par SMS</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Son des transactions</p>
                  <p className="text-sm text-gray-600">Confirmation sonore</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Déconnexion */}
        <Button
          variant="ghost"
          className="w-full h-12 text-red-600 hover:bg-red-50 rounded-xl"
          onClick={() => {
            setCurrentScreen("welcome")
            setPhoneNumber("")
            setPassword("")
            setLoginError("")
          }}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  )

  const ChangePasswordScreen = () => (
    <div className="flex flex-col h-full bg-zinc-50">
      <div className="bg-white p-6 pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("settings")}>
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900">Changer le mot de passe</h2>
          <div></div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="mb-6">
          <p className="text-gray-600 text-center">
            Saisissez votre mot de passe actuel et choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <div className="space-y-4">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
            <Input
              type="password"
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 text-base rounded-xl border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              autoComplete="current-password"
            />
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 text-base rounded-xl border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              autoComplete="new-password"
            />
            {newPassword && newPassword.length < 8 && (
              <p className="text-sm text-red-500 mt-1">Le mot de passe doit contenir au moins 8 caractères</p>
            )}
          </div>

          {/* Confirmer le mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 text-base rounded-xl border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              autoComplete="new-password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          {/* Critères de sécurité */}
          <Card className="shadow-sm border-0 rounded-2xl bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Critères de sécurité</h3>
              <div className="space-y-2 text-sm">
                <div
                  className={`flex items-center space-x-2 ${newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle className={`w-4 h-4 ${newPassword.length >= 8 ? "text-green-600" : "text-gray-400"}`} />
                  <span>Au moins 8 caractères</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${/[A-Z]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle
                    className={`w-4 h-4 ${/[A-Z]/.test(newPassword) ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span>Une lettre majuscule</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${/[0-9]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle
                    className={`w-4 h-4 ${/[0-9]/.test(newPassword) ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span>Un chiffre</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${/[!@#$%^&*]/.test(newPassword) ? "text-green-600" : "text-gray-500"}`}
                >
                  <CheckCircle
                    className={`w-4 h-4 ${/[!@#$%^&*]/.test(newPassword) ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span>Un caractère spécial</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-6">
        <Button
          onClick={() => {
            // Simulate password change
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setCurrentScreen("settings")
          }}
          className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl"
          disabled={
            !currentPassword ||
            !newPassword ||
            !confirmPassword ||
            newPassword !== confirmPassword ||
            newPassword.length < 8 ||
            !/[A-Z]/.test(newPassword) ||
            !/[0-9]/.test(newPassword) ||
            !/[!@#$%^&*]/.test(newPassword)
          }
        >
          Changer le mot de passe
        </Button>
      </div>
    </div>
  )

  const TwoFactorAuthScreen = () => {
    const generateBackupCodes = () => {
      const codes = []
      for (let i = 0; i < 8; i++) {
        codes.push(Math.random().toString(36).substring(2, 8).toUpperCase())
      }
      return codes
    }

    const handleEnableTwoFactor = () => {
      const codes = generateBackupCodes()
      setBackupCodes(codes)
      setTwoFactorEnabled(true)
      setShowBackupCodes(true)
    }

    const handleDisableTwoFactor = () => {
      setTwoFactorEnabled(false)
      setBackupCodes([])
      setShowBackupCodes(false)
    }

    return (
      <div className="flex flex-col h-full bg-zinc-50">
        <div className="bg-white p-6 pb-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentScreen("settings")}>
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">Authentification 2FA</h2>
            <div></div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Status */}
          <Card
            className={`shadow-sm border-0 rounded-2xl ${twoFactorEnabled ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    twoFactorEnabled ? "bg-green-100" : "bg-gray-100"
                  }`}
                >
                  <Shield className={`w-5 h-5 ${twoFactorEnabled ? "text-green-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Authentification à deux facteurs</h3>
                  <p className={`text-sm ${twoFactorEnabled ? "text-green-600" : "text-gray-600"}`}>
                    {twoFactorEnabled ? "Activée" : "Désactivée"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <div className="text-center space-y-3">
            <h3 className="font-semibold text-gray-900">Sécurisez votre compte</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte en
              demandant un code de vérification en plus de votre mot de passe.
            </p>
          </div>

          {!twoFactorEnabled ? (
            <>
              {/* Avantages */}
              <Card className="shadow-sm border-0 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Avantages de la 2FA</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Protection renforcée</p>
                        <p className="text-sm text-gray-600">Même si votre mot de passe est compromis</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Codes de sauvegarde</p>
                        <p className="text-sm text-gray-600">Accès d'urgence si vous perdez votre téléphone</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Notifications de sécurité</p>
                        <p className="text-sm text-gray-600">Alertes en cas de tentative de connexion</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bouton d'activation */}
              <Button
                onClick={handleEnableTwoFactor}
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl"
              >
                <Shield className="w-5 h-5 mr-2" />
                Activer l'authentification 2FA
              </Button>
            </>
          ) : (
            <>
              {/* Codes de sauvegarde */}
              {showBackupCodes && (
                <Card className="shadow-sm border-0 rounded-2xl bg-yellow-50 border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold text-gray-900">Codes de sauvegarde</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Conservez ces codes en lieu sûr. Ils vous permettront d'accéder à votre compte si vous perdez
                      votre téléphone.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-white p-2 rounded-lg border text-center font-mono text-sm">
                          {code}
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          navigator.clipboard.writeText(backupCodes.join("\n"))
                        }}
                      >
                        Copier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => setShowBackupCodes(false)}
                      >
                        J'ai sauvegardé
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Options de gestion */}
              <Card className="shadow-sm border-0 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Gestion de la 2FA</h3>
                  <div className="space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-12 px-0"
                      onClick={() => setShowBackupCodes(true)}
                    >
                      <span>Voir les codes de sauvegarde</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-12 px-0"
                      onClick={() => {
                        const newCodes = generateBackupCodes()
                        setBackupCodes(newCodes)
                        setShowBackupCodes(true)
                      }}
                    >
                      <span>Générer de nouveaux codes</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Bouton de désactivation */}
              <Button
                variant="outline"
                onClick={handleDisableTwoFactor}
                className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 rounded-xl bg-transparent"
              >
                Désactiver l'authentification 2FA
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  const FABMenu = () => (
    <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowFABMenu(false)}>
      <div className="absolute bottom-24 right-6 space-y-3">
        <Button
          onClick={() => {
            setCurrentScreen("supply")
            setShowFABMenu(false)
          }}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => {
            setTransactionType("withdrawal")
            setCurrentScreen("transaction")
            setShowFABMenu(false)
          }}
          className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <ArrowUpRight className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => {
            setTransactionType("deposit")
            setCurrentScreen("transaction")
            setShowFABMenu(false)
          }}
          className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <ArrowDownLeft className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen />
      case "login":
        return <LoginScreen />
      case "otp":
        return <OTPScreen />
      case "dashboard":
        return <DashboardScreen />
      case "transaction":
        return <TransactionScreen />
      case "supply":
        return <SupplyScreen />
      case "activity":
        return <ActivityScreen />
      case "notifications":
        return <NotificationsScreen />
      case "settings":
        return <SettingsScreen />
      case "change-password":
        return <ChangePasswordScreen />
      case "two-factor-auth":
        return <TwoFactorAuthScreen />
      default:
        return <WelcomeScreen />
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {renderScreen()}

      {/* FAB */}
      {showFAB && (
        <Button
          onClick={() => setShowFABMenu(!showFABMenu)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg z-50"
        >
          <Menu className="w-6 h-6" />
        </Button>
      )}

      {/* FAB Menu */}
      {showFABMenu && <FABMenu />}

      {/* Bottom Navigation for Dashboard */}
      {currentScreen === "dashboard" && (
        <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex justify-around">
            <Button variant="ghost" size="sm" className="flex flex-col items-center space-y-1 text-teal-600">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Accueil</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1 text-gray-500"
              onClick={() => setCurrentScreen("activity")}
            >
              <Clock className="w-5 h-5" />
              <span className="text-xs">Activité</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1 text-gray-500"
              onClick={() => setCurrentScreen("settings")}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Paramètres</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
