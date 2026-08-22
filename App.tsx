import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

/*
 * Jour J — a joke that installs.
 *
 * It exists to be shared, opened once, laughed at, and to leave one thing
 * behind: that a real Android build arrived on a phone from a link, and that
 * Sokial put it there.
 *
 * Two rules held throughout. The prophecy is nonsense and says so — a novelty
 * app that pretends to be serious about the Second Coming is both a lie and a
 * worse joke. And the Sokial line is not a watermark hidden in a corner: it is
 * the payoff, so it gets a tap target and a real sentence.
 */

const SOKIAL_URL = 'https://sokial.app';

/*
 * The prophecy, computed from nothing.
 *
 * Deliberately deterministic per draw and deliberately absurd. Each step is
 * printed so the reader can watch the machine make it up — which is the joke,
 * and also the honest version of it.
 */
type Prophecy = {
  date: Date;
  signs: Array<{ label: string; value: string }>;
  confidence: number;
  verdict: string;
};

const OMENS = [
  'Alignement de Vénus et du réseau 4G',
  'Nombre de chats noirs par habitant',
  'Résonance du café froid',
  'Indice de pigeons en vol stationnaire',
  'Fréquence des chaussettes dépareillées',
  'Densité de nuages en forme de baguette',
  'Coefficient de marée des groupes WhatsApp',
  'Taux de batterie à 1 %',
];

const VERDICTS = [
  'Prévoir un parapluie.',
  'Ne pas annuler vos congés.',
  'La marge d’erreur est de trois siècles.',
  'Les calculs ont été refaits deux fois. Par la même personne.',
  'Confiance élevée, méthode inexistante.',
  'Compatible avec vos plans du week-end.',
];

function draw<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function prophesy(): Prophecy {
  // Somewhere between next week and four centuries out. Wide enough that the
  // number is obviously theatre.
  const days = 7 + Math.floor(Math.random() * 146_000);
  const date = new Date(Date.now() + days * 86_400_000);

  const signs = [...OMENS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(label => ({
      label,
      value: `${(Math.random() * 99 + 1).toFixed(1)} %`,
    }));

  return {
    date,
    signs,
    confidence: Math.floor(Math.random() * 39) + 61,
    verdict: draw(VERDICTS),
  };
}

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

function longDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Days remaining, which is the number people actually screenshot. */
function daysUntil(d: Date): number {
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
}

function App(): React.JSX.Element {
  const [prophecy, setProphecy] = useState<Prophecy>(() => prophesy());
  const [working, setWorking] = useState(false);

  /*
   * The pause before the answer.
   *
   * There is nothing to compute — the result exists the moment the button is
   * pressed. The delay is the joke: an oracle that answers instantly is a
   * random number generator, and one that thinks for a second is a prophecy.
   */
  const fade = useRef(new Animated.Value(1)).current;
  const rise = useRef(new Animated.Value(0)).current;

  const reveal = useCallback(() => {
    fade.setValue(0);
    rise.setValue(12);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise]);

  useEffect(reveal, [reveal]);

  function consult() {
    if (working) {
      return;
    }
    setWorking(true);
    Animated.timing(fade, {
      toValue: 0.15,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setProphecy(prophesy());
      setWorking(false);
      reveal();
    }, 1400);
  }

  const remaining = daysUntil(prophecy.date);

  return (
    <SafeAreaProvider>
      {/*
        No backgroundColor: React Native 0.87 removed the prop when
        edge-to-edge became mandatory on Android. The bar sits over the
        screen's own background, which is why that colour is on the container.
      */}
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>JOUR J</Text>
          <Text style={styles.kicker}>
            L’algorithme le moins fiable jamais compilé
          </Text>

          <Animated.View
            style={[
              styles.card,
              { opacity: fade, transform: [{ translateY: rise }] },
            ]}
          >
            <Text style={styles.cardLabel}>Retour prévu le</Text>
            <Text style={styles.date}>{longDate(prophecy.date)}</Text>

            <View style={styles.countRow}>
              <Text style={styles.count}>
                {remaining.toLocaleString('fr-FR')}
              </Text>
              <Text style={styles.countUnit}>jours</Text>
            </View>

            <View style={styles.divider} />

            {prophecy.signs.map(sign => (
              <View key={sign.label} style={styles.signRow}>
                <Text style={styles.signLabel} numberOfLines={1}>
                  {sign.label}
                </Text>
                <Text style={styles.signValue}>{sign.value}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.signRow}>
              <Text style={styles.confidenceLabel}>Confiance</Text>
              <Text style={styles.confidenceValue}>
                {prophecy.confidence} %
              </Text>
            </View>
            <Text style={styles.verdict}>{prophecy.verdict}</Text>
          </Animated.View>

          <Pressable
            onPress={consult}
            disabled={working}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              working && styles.buttonWorking,
            ]}
          >
            <Text style={styles.buttonText}>
              {working ? 'Consultation des astres…' : 'Reconsulter les astres'}
            </Text>
          </Pressable>

          {/*
            The disclaimer is not fine print hidden at the bottom of a scroll.
            The app is funnier when it admits what it is, and a novelty that
            pretends to be serious about this subject is just a lie.
          */}
          <Text style={styles.disclaimer}>
            Aucune donnée n’a été consultée. Aucun astre n’a été dérangé. Ces
            chiffres sont tirés au hasard, et le resteront.
          </Text>

          {/*
            The point of the whole thing. Given the same weight as the app
            itself, because the app is the pretext.
          */}
          <Pressable
            onPress={() => Linking.openURL(SOKIAL_URL)}
            style={({ pressed }) => [
              styles.footer,
              pressed && styles.footerPressed,
            ]}
          >
            <Text style={styles.footerLead}>
              Cette app est arrivée sur ton téléphone par un lien.
            </Text>
            <Text style={styles.footerBrand}>
              Compilée et distribuée avec Sokial
            </Text>
            <Text style={styles.footerLink}>sokial.app →</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B10' },
  content: { padding: 24, paddingBottom: 40 },

  eyebrow: {
    color: '#F5C542',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
  },
  kicker: {
    color: '#8A8A99',
    fontSize: 15,
    marginTop: 6,
    lineHeight: 21,
  },

  card: {
    marginTop: 28,
    padding: 22,
    borderRadius: 20,
    backgroundColor: '#14141C',
    borderWidth: 1,
    borderColor: '#23232F',
  },
  cardLabel: {
    color: '#8A8A99',
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  date: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: -0.5,
  },

  countRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 18 },
  count: {
    color: '#F5C542',
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
    // The number changes on every draw; tabular figures keep it from dancing.
    fontVariant: ['tabular-nums'],
  },
  countUnit: {
    color: '#8A8A99',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '600',
  },

  divider: { height: 1, backgroundColor: '#23232F', marginVertical: 18 },

  signRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  signLabel: { color: '#B9B9C6', fontSize: 14, flex: 1, marginRight: 12 },
  signValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  confidenceLabel: { color: '#B9B9C6', fontSize: 14, fontWeight: '600' },
  confidenceValue: {
    color: '#5BD98A',
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  verdict: {
    color: '#8A8A99',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },

  button: {
    marginTop: 22,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { transform: [{ scale: 0.97 }], backgroundColor: '#E0B33B' },
  buttonWorking: { backgroundColor: '#3A3520' },
  buttonText: { color: '#0B0B10', fontSize: 16, fontWeight: '700' },

  disclaimer: {
    color: '#5F5F6E',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 18,
    textAlign: 'center',
  },

  footer: {
    marginTop: 32,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#23232F',
    backgroundColor: '#101018',
    alignItems: 'center',
  },
  footerPressed: { backgroundColor: '#16161F' },
  footerLead: { color: '#8A8A99', fontSize: 13, textAlign: 'center' },
  footerBrand: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  footerLink: {
    color: '#F5C542',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default App;
