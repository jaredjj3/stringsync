package env

import (
	"os"
	"testing"
)

func setup(key, val string) func() {
	og := os.Getenv(key)
	os.Setenv(key, val)
	return func() {
		os.Setenv(key, og)
	}
}

func TestMustGetEnvString(t *testing.T) {
	for _, test := range []struct {
		name      string
		key       string
		val       string
		want      string
		wantPanic bool
	}{
		{
			name: "returns the env value as a string",
			key:  "FOO",
			val:  "bar",
			want: "bar",
		}, {
			name:      "panics when the env value is empty",
			key:       "FOO",
			wantPanic: true,
		},
	} {
		t.Run(test.name, func(t *testing.T) {
			cleanup := setup(test.key, test.val)
			defer cleanup()

			defer func() {
				if gotPanic := recover() != nil; gotPanic != test.wantPanic {
					t.Errorf("gotPanic = %v, wantPanic = %v", gotPanic, test.wantPanic)
				}
			}()

			if got := MustGetEnvString(test.key); got != test.want {
				t.Errorf("MustGetEnvString(%q) = %q, want %q", test.key, got, test.want)
			}
		})
	}
}

func TestMustGetEnvInt(t *testing.T) {
	for _, test := range []struct {
		name      string
		key       string
		val       string
		want      int
		wantPanic bool
	}{
		{
			name: "returns the env value as an int",
			key:  "FOO",
			val:  "42",
			want: 42,
		}, {
			name:      "panics when the env value is empty",
			key:       "FOO",
			wantPanic: true,
		}, {
			name:      "panics when the env value is not an int",
			key:       "FOO",
			val:       "bar",
			wantPanic: true,
		},
	} {
		t.Run(test.name, func(t *testing.T) {
			cleanup := setup(test.key, test.val)
			defer cleanup()

			defer func() {
				if gotPanic := recover() != nil; gotPanic != test.wantPanic {
					t.Errorf("gotPanic = %v, wantPanic = %v", gotPanic, test.wantPanic)
				}
			}()

			if got := MustGetEnvInt(test.key); got != test.want {
				t.Errorf("MustGetEnvInt(%q) = %q, want %q", test.key, got, test.want)
			}
		})
	}
}
